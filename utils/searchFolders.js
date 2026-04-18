import fs from 'fs';
import path from 'path';

export default function* searchFolders(dir, name, parent) {
  if (!parent) {
    parent = "pg"
  }
  yield {
    name: name,
    path: dir,
    parent: parent
  };


  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const dirName = path.join(dir, file.name);
      yield* searchFolders(dirName, file.name, `${parent}_${name}`);
    }
  }
}
