import fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output} from 'node:process';
import definePortraitGroup from "./portraits/define_portrait_group.js";
import definePortrait from "./portraits/define_portrait.js";

const path = {};

// Get mod root directory
const rl = readline.createInterface({ input, output });
const response = await rl.question("Enter the root path of your mod: ");
path.root = response.toString().trim();
console.log(`Your mod path: ${path.root}`);
rl.close();

path.models = `${path.root}gfx/models/portraits/`

// Get portrait category directories
const modelDirFiles = fs.readdirSync(path.models, { withFileTypes: true });
const modelDirs = modelDirFiles.filter(file => file.isDirectory);

// Find portrait groups and their content
const portraitGroups = [];
modelDirs.forEach((dir, modelIndex) => {
  const modelDirContent = fs.readdirSync(dir.parentPath+dir.name, { withFileTypes: true });
  const portraitGroupDirs = modelDirContent.filter(file => file.isDirectory);

  // Get dds files in portrait group directory.
  portraitGroupDirs.forEach((dir, portraitIndex) => {
    const portraitGroupContent = fs.readdirSync(`${dir.parentPath}/${dir.name}`, { withFileTypes: true });
    const portraitGroupImages = portraitGroupContent.filter(file => file.name.substring(file.name.length - 3) == "dds");
    const portraits = [];
    portraitGroupImages.forEach((portrait) => {
      portraits.push(definePortrait(portrait));
    });

    const portraitGroup = definePortraitGroup(portraits, `pg_${portraitGroupDirs[portraitIndex].name}_${modelDirs[modelIndex].name}`);
    portraitGroups.push(portraitGroup);
  });
});

// Create portrait group files and write portrait imports
portraitGroups.forEach((group) => {
  const filePath = `${path.root}gfx/portraits/portraits/${group.name}.txt`;
  group.content = "portraits = {\n";

  group.portraits.forEach((portrait, index) => {
    portrait.name = `${group.name}_${index}`;
    group.content += `    ${portrait.name} = { texturefile = "${portrait.dir.parentPath}/${portrait.dir.name}" }\n`;
  });

  group.content += "}"
  fs.writeFile(filePath, group.content, (err) => {
    if (err) throw err;
    console.log(`File written successfully: ${filePath}`);
  });
});

// Write portrait groups in portrait group files after portrait imports
portraitGroups.forEach((group) => {
  const filePath = `${path.root}gfx/portraits/portraits/${group.name}.txt`;
  group.content += `\n
portrait_groups = {
    ${group.name} = {
        default = ${group.portraits[0].name}
        game_setup = {
            add = {
                portraits = {\n`

  group.portraits.forEach((portrait, index) => {
    group.content += `                    ${portrait.name}\n`;
  });

  group.content += "}"
  fs.writeFile(filePath, group.content, (err) => {
    if (err) throw err;
    console.log(`File written successfully: ${filePath}`);
  });
});
