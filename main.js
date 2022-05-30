const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs/promises');
const projectName = core.getInput("projectName");
const projectType = core.getInput("projectType");

async function run(projectType) {   
    if(projectType === "NetFramework"){
        await UpdateNetFramework();
    } else if (projectType === "NetCore") {
        await UpdateNetCore();
    } else if (projectType === "Golang") {
        await UpdateGolang();
    }
}

async function UpdateNetFramework(){
    const projPath = `src/${projectName}/${projectName}.csproj`;
    var csProjContents = await fs.readFile(projPath, 'utf8');

    console.log(`projPath: ${projPath}`);

    const fileVerRegex = /<FileVersion>(\d+).(\d+).(\d+).(\d+)<\/FileVersion>/g
    const appVerRegex = /<ApplicationVersion>(\d+).(\d+).(\d+).(\d+)<\/ApplicationVersion>/g
    const assVerRegex = /<AssemblyVersion>(\d+).(\d+).(\d+).(\d+)<\/AssemblyVersion>/g
    const propsRegex = /AssemblyVersion\(\"(\d+).(\d+).(\d+).(\d+)\"\)/g
    const propsFileRegex = /AssemblyFileVersion\(\"(\d+).(\d+).(\d+).(\d+)\"\)/g

    var matches = appVerRegex.exec(csProjContents);
    var major = Number(matches[1]);
    var minor = Number(matches[2]);
    var patch = Number(matches[3]);
    var build = Number(matches[4]);

    var newVersion = `${major}.${minor}.${patch}.${build+1}`;
    csProjContents = csProjContents.replace(fileVerRegex, `<FileVersion>${newVersion}</FileVersion>`)
                                   .replace(assVerRegex, `<AssemblyVersion>${newVersion}</AssemblyVersion>`)
                                   .replace(appVerRegex, `<ApplicationVersion>${newVersion}</ApplicationVersion>`);

    await fs.writeFile(projPath, csProjContents);

    const propsFilePath = `src\\${projectName}\\Properties\\AssemblyInfo.cs`;
    var propsFileContent = await fs.readFile(propsFilePath, 'utf8');
    propsFileContent = propsFileContent.replace(propsRegex, `AssemblyVersion("${newVersion}")`)
                                       .replace(propsFileRegex, `AssemblyFileVersion("${newVersion}")`);

    await fs.writeFile(propsFilePath, propsFileContent);
}

async function UpdateGolang(){

}

async function UpdateNetCore(){
    try {
        const projPath = core.getInput("projectFile");
        var csProjContents = await fs.readFile(projPath, 'utf8');
        // read contents, now get the version fields
        const prefixVerRegex = /<VersionPrefix>(\d+).(\d+).(\d+).(\d+)<\/VersionPrefix>/g
        const fileVerRegex = /<FileVersion>(\d+).(\d+).(\d+).(\d+)<\/FileVersion>/g
        const appVerRegex = /<ApplicationVersion>(\d+).(\d+).(\d+).(\d+)<\/ApplicationVersion>/g
        const assVerRegex = /<AssemblyVersion>(\d+).(\d+).(\d+).(\d+)<\/AssemblyVersion>/g
        var matches = prefixVerRegex.exec(csProjContents);
        var major = Number(matches[1]);
        var minor = Number(matches[2]);
        var patch = Number(matches[3]);
        var build = Number(matches[4]);

        var newVersion = `${major}.${minor}.${patch}.${build+1}`;
        csProjContents = csProjContents.replace(prefixVerRegex, `<VersionPrefix>${newVersion}</VersionPrefix>`)
                                       .replace(fileVerRegex, `<FileVersion>${newVersion}</FileVersion>`)
                                       .replace(assVerRegex, `<AssemblyVersion>${newVersion}</AssemblyVersion>`)
                                       .replace(appVerRegex, `<ApplicationVersion>${newVersion}</ApplicationVersion>`);

        await fs.writeFile(`src/${projectName}/${projectName}.csproj`, csProjContents);
        
    } catch (e) {
        console.error("ERROR", e);
        core.setFailed(e.message);
    }    
}

run("NetFramework");