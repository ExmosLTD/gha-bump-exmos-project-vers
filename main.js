const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;
const path = require("path");
const projectName = core.getInput("projectName");
const projectType = core.getInput("projectType");

async function run() {
    if(projectType === "NetFramework"){
        await UpdateNetFramework();
    } else if (projectType === "NetCore") {
        await UpdateNetCore();
    } else if (projectType === "Golang") {
        await UpdateGolang();
    }
}

//D:\a\dev-test-hello-world\dev-test-hello-world\./.github/actions/gha-bump-exmos-project-vers\dist/main.js'

async function UpdateNetFramework(){

    console.log(`workspace: ${process.env.GITHUB_WORKSPACE}`);
    const projPath = path.join("src", projectName, `${projectName}.csproj`);
    console.log(`projPath: ${projPath}`);
    var csProjContents = await fs.readFile(projPath, 'utf8');
    console.log("Read csproj contents");
    console.log(csProjContents);
    const fileVerRegex = /<FileVersion>(\d+).(\d+).(\d+).(\d+)<\/FileVersion>/g
    const appVerRegex = /<ApplicationVersion>(\d+).(\d+).(\d+).(\d+)<\/ApplicationVersion>/g
    const assVerRegex = /<AssemblyVersion>(\d+).(\d+).(\d+).(\d+)<\/AssemblyVersion>/g
    const propsRegex = /AssemblyVersion\(\"(\d+).(\d+).(\d+).(\d+)\"\)/g
    const propsFileRegex = /AssemblyFileVersion\(\"(\d+).(\d+).(\d+).(\d+)\"\)/g

    var matches = assVerRegex.exec(csProjContents);
    console.log(matches);
    var major = Number(matches[1]);
    var minor = Number(matches[2]);
    var patch = Number(matches[3]);
    var build = Number(matches[4]);

    
    var newVersion = `${major}.${minor}.${patch}.${build+1}`;
    console.log(`New version ${newVersion}`);

    csProjContents = csProjContents.replace(fileVerRegex, `<FileVersion>${newVersion}</FileVersion>`)
                                   .replace(assVerRegex, `<AssemblyVersion>${newVersion}</AssemblyVersion>`)
                                   .replace(appVerRegex, `<ApplicationVersion>${newVersion}</ApplicationVersion>`);

    console.log(`Updated contents, ready to write them.`);
    await fs.writeFile(projPath, csProjContents);
    console.log("wrote updated csproj");
    const propsFilePath = path.join("src", projectName, "Properties", "AssemblyInfo.cs");
    console.log(`props Path: ${propsFilePath}`);
    console.log("Read properties file contents");
    var propsFileContent = await fs.readFile(propsFilePath, 'utf8');
    propsFileContent = propsFileContent.replace(propsRegex, `AssemblyVersion("${newVersion}")`)
                                       .replace(propsFileRegex, `AssemblyFileVersion("${newVersion}")`);

    console.log("WRiting properties file contents");
    await fs.writeFile(propsFilePath, propsFileContent);
    console.log("WRote properties file contents");
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

run();