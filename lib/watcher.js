'use babel';
// @alias watcher
// Responsible for finding directories, watching them for changes.

const ignoredDirs = ['node_modules', '.git'];

export function getDirectoriesRecursively(root) {
  let allDirs = [];

  root.getEntriesSync()
    .filter(entry => {
      return entry.isDirectory()
        && ignoredDirs.indexOf(entry.getBaseName()) === -1;
    })
    .map(directory => {
      allDirs.push(directory);
      allDirs = allDirs.concat(getDirectoriesRecursively(directory));
    });

  return allDirs;
}

export function onDirsChanged(callback) {
  const dir = atom.project.getDirectories()[0];

  const allDirs = getDirectoriesRecursively(dir);
  allDirs.map(dir => {
    console.log(dir.getPath())
    dir.onDidChange(() => {
      console.log(`${dir.getBaseName()} changed`);
      callback(dir);
    });
  });
}