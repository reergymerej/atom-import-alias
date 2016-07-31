'use babel';
// @alias watcher
// Responsible for finding directories, watching them for changes.

import { CompositeDisposable } from 'atom';

let ignoredDirs = [];
const subscriptions = new CompositeDisposable();

function getDirectoriesRecursively(root) {
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

export function stopWatching() {
  console.log('stopWatching');
  subscriptions.dispose();
  subscriptions.clear();
}

export function startWatching(callback) {
  console.log('startWatching');
  stopWatching()
  const dir = atom.project.getDirectories()[0];

  const allDirs = getDirectoriesRecursively(dir);
  const watchers = allDirs.map(dir => {
    const disposable = dir.onDidChange(() => {
      console.log(`${dir.getBaseName()} changed`);
      callback(dir);
    });

    return disposable;
  });

  subscriptions.add(...watchers);
}

export function ignore(dirs) {
  // TODO: If we're already watching, update what we're watching.
  ignoredDirs = dirs.splice(0);
}
