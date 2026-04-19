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
  // Get dds files and options in portrait group directory.
  portraitGroupDirs.forEach((groupDir) => {
    const portraitGroupContent = fs.readdirSync(`${groupDir.path}`, {
      withFileTypes: true
    }).map(dirent => {
      const fullPath = path.join(groupDir.path, dirent.name);
      dirent.relativePath = path.relative(pathObj.root, fullPath);
      return dirent
    });

    const portraitGroupImages = portraitGroupContent.filter(file => path.extname(file.name) == ".dds");

    if (portraitGroupImages.length > 0) {
      const portraits = [];
      portraitGroupImages.forEach((portrait) => {
        portraits.push(definePortrait(portrait));
      });

      // Check for options json in group folder, get the data from it.
      const portraitGroup = definePortraitGroup(portraits, `${groupDir.parent}_${groupDir.name}`);
      const portraitGroupOptionsFile = portraitGroupContent.find(file => file.name === "config.json");
      if (portraitGroupOptionsFile) {
        const optionsPath = `${portraitGroupOptionsFile.parentPath}/${portraitGroupOptionsFile.name}`;
        const optionsJSON = fs.readFileSync(optionsPath, 'utf8');
        try {
          portraitGroup.options = JSON.parse(optionsJSON);
        } catch (error) {
          console.log("Error reading (likely invalid) json file: " + optionsPath);
        }
      } else {
        portraitGroup.options = {}
      }

      portraitGroups.push(portraitGroup);
    }
  });
});

// Create portrait group files and write portrait imports
portraitGroups.forEach((group) => {
  group.name = group.name; // Name that file and portrait names are based upon
  group.group_name = group.name; // Group name portraits are assigned to.
  group.has_game_setup = true; // Include portraits in game setup.
  group.has_species = true; // Include portraits in species.
  group.has_pop = true; // Include portraits in pops.
  group.has_leader = true; // Include portraits in leaders.
  group.has_ruler = true; // Include portraits in rulers.
  group.has_default = true; // Include default portrait.
  group.game_setup_conditions = {};
  group.species_conditions = {};
  group.pop_conditions = {};
  group.leader_conditions = {};

  Object.assign(group, group.options);

  console.log(group)

  const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
  group.content = "portraits = {\n";

  group.portraits.forEach((portrait, index) => {
    portrait.name = `${group.name}_${index}`;
    group.content += `    ${portrait.name} = { texturefile = "${portrait.dir.relativePath}" }\n`;
  });

  group.content += "}"
  fs.writeFile(filePath, group.content, (err) => {
    if (err) throw err;
    console.log(`File created successfully: ${filePath}`);
  });
});

// Write game_setup in portrait group files after portrait imports
portraitGroups.forEach((group) => {
  if (group.has_game_setup) {
    const filePath = `${pathObj.root}gfx/portraits/portraits/${group.name}.txt`;
    group.content += "\n"
    group.content += "portrait_groups = {\n"
    group.content += `    ${group.group_name} = {\n`
    if (group.has_default) {
      group.content += `        default = ${group.portraits[0].name}\n`
    }
    group.content += "        game_setup = {\n"
    group.content += "            add = {\n"
    group.content += "                portraits = {\n"

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
  if (group.has_species) {
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
  if (group.has_pop) {
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
  if (group.has_leader) {
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
  if (group.has_ruler) {
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
