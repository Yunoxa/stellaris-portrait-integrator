import fs from 'fs';

process.stdout.write('Enter the root path of your mod: ');

process.stdin.on('data', (data) => {
  const paths = {};
  paths.root = data.toString().trim();
  paths.models = `${paths.root}gfx/models/portraits/`
  console.log(`Your root mod path: ${paths.root}`);
  console.log(fs.readdirSync(paths.root));
  console.log(fs.readdirSync(paths.models))
  process.exit();
});
