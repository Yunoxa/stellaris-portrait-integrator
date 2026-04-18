import fs from 'fs';
import path from 'path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output} from 'node:process';
import definePortraitGroup from "./portraits/define_portrait_group.js";
import definePortrait from "./portraits/define_portrait.js";
import searchFolders from "./utils/searchFolders.js";

const pathObj = {};

// Get mod root directory
const rl = readline.createInterface({ input, output });
const response = await rl.question("Enter the root path of your mod: ");
pathObj.root = response.toString().trim();
console.log(`Your mod path: ${pathObj.root}`);
rl.close();

pathObj.models = `${pathObj.root}gfx/models/portraits/`

// Get portrait category directories
const modelDirFiles = fs.readdirSync(pathObj.models, { withFileTypes: true });
const modelDirs = modelDirFiles.filter(file => file.isDirectory());

// Find portrait groups and their content
const portraitGroups = [];
modelDirs.forEach((modelDir) => {
  const portraitGroupDirs = [];
  for (const folder of searchFolders(`${modelDir.parentPath}/${modelDir.name}`, modelDir.name)) {
    portraitGroupDirs.push(folder);
  }
  // Get dds files in portrait group directory.
  portraitGroupDirs.forEach((groupDir) => {
    const portraitGroupContent = fs.readdirSync(`${groupDir.path}`, { withFileTypes: true });
    const portraitGroupImages = portraitGroupContent.filter(file => path.extname(file.name) == ".dds");
    if (portraitGroupImages.length > 0) {
      const portraits = [];
      portraitGroupImages.forEach((portrait) => {
        portraits.push(definePortrait(portrait));
      });

      const portraitGroup = definePortraitGroup(portraits, `${groupDir.parent}_${groupDir.name}`);
      portraitGroups.push(portraitGroup);
    }
  });
});

// Create portrait group files and write portrait imports
portraitGroups.forEach((group) => {
  group.settings = {
    name: group.name,
    game_setup: true,
    species: true,
    pop: true,
    leader: true,
    ruler: true,
    game_setup_conditions: {},
    species_conditions: {},
    pop_species_traits: {},
    leader_traits: {},
    leader_species_traits: {}
  }
  const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
  group.content = "portraits = {\n";

  group.portraits.forEach((portrait, index) => {
    portrait.name = `${group.name}_${index}`;
    group.content += `    ${portrait.name} = { texturefile = "${portrait.dir.parentPath}/${portrait.dir.name}" }\n`;
  });

  group.content += "}"
  fs.writeFile(filePath, group.content, (err) => {
    if (err) throw err;
    console.log(`File created successfully: ${filePath}`);
  });
});

// Write game_setup in portrait group files after portrait imports
portraitGroups.forEach((group) => {
  if (group.settings.game_setup) {
    const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
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

    group.content += `                }
            }
        }
    `
    fs.writeFile(filePath, group.content, (err) => {
      if (err) throw err;
      console.log(`game_setup written successfully: ${filePath}`);
    });
  }
});

// Write species in portrait group files
portraitGroups.forEach((group) => {
  if (group.settings.species) {
    const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
    group.content += `
        species = {
            add = {
                portraits = {\n`

    group.portraits.forEach((portrait, index) => {
      group.content += `                    ${portrait.name}\n`;
    });

    group.content += `                }
            }
        }
    `
    fs.writeFile(filePath, group.content, (err) => {
      if (err) throw err;
      console.log(`pop written successfully: ${filePath}`);
    });
  }
});

// Write pop in portrait group files
portraitGroups.forEach((group) => {
  if (group.settings.pop) {
    const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
    group.content += `
        pop = {
            add = {
                portraits = {\n`

    group.portraits.forEach((portrait, index) => {
      group.content += `                    ${portrait.name}\n`;
    });

    group.content += `                }
            }
        }
    `
    fs.writeFile(filePath, group.content, (err) => {
      if (err) throw err;
      console.log(`pop written successfully: ${filePath}`);
    });
  }
});

// Write leader in portrait group files
portraitGroups.forEach((group) => {
  if (group.settings.leader) {
    const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
    group.content += `
        leader = {
            add = {
                portraits = {\n`

    group.portraits.forEach((portrait, index) => {
      group.content += `                    ${portrait.name}\n`;
    });

    group.content += `                }
            }
        }
    `
    fs.writeFile(filePath, group.content, (err) => {
      if (err) throw err;
      console.log(`leader written successfully: ${filePath}`);
    });
  }
});

// Write ruler in portrait group files
portraitGroups.forEach((group) => {
  if (group.settings.ruler) {
    const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
    group.content += `
        ruler = {
            add = {
                portraits = {\n`

    group.portraits.forEach((portrait, index) => {
      group.content += `                    ${portrait.name}\n`;
    });

    group.content += `                }
            }
        }
    }
}`
    fs.writeFile(filePath, group.content, (err) => {
      if (err) throw err;
      console.log(`ruler written successfully: ${filePath}`);
    });
  }
});
