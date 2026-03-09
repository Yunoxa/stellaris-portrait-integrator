import fs from 'fs';

process.stdout.write('Enter the root path of your mod: ');

process.stdin.on('data', (data) => {
  const paths = {};
  paths.root = data.toString().trim();
  paths.models = `${paths.root}gfx/models/portraits/`

  // Get portrait category directories
  const modelDirFiles = fs.readdirSync(paths.models, { withFileTypes: true });
  const modelDirs = modelDirFiles.filter(file => file.isDirectory);

  modelDirs.forEach((dir) => {
    const modelDirContent = fs.readdirSync(dir.parentPath+dir.name, { withFileTypes: true });
    const portraitGroupDirs = modelDirContent.filter(file => file.isDirectory);

    // Get dds files in portrait group directory.
    portraitGroupDirs.forEach((dir) => {
      const portraitGroupContent = fs.readdirSync(`${dir.parentPath}/${dir.name}`, { withFileTypes: true });
      console.log(portraitGroupContent)
      const portraitGroupImages = portraitGroupContent.filter(file => file.name.substring(file.name.length - 3) == "dds");
      console.log(portraitGroupImages)
    });
  });

  process.exit();
});
