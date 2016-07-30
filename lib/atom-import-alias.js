'use babel';

import { CompositeDisposable } from 'atom';
import { transform, ignore } from 'import-alias';

const ignoredDirs = ['node_modules', '.git'];

ignore(ignoredDirs);

function getDirectoriesRecursively(root) {
  let allDirs = [];

  const entries = root.getEntriesSync()
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

export default {
  activate(state) {
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-import-alias:transform': () => this.toggle(),
    }));





    // figre out what dirs we want to watch
    const dir = atom.project.getDirectories()[0];

    const allDirs = getDirectoriesRecursively(dir);
    allDirs.map(dir => {
      console.log(dir.getPath())
      dir.onDidChange(() => {
        console.log(`${dir.getBaseName()} changed`);
        this.transform();
      });
    });
  },

  deactivate() {
  },

  serialize() {
    return {
    };
  },

  transform() {
    const dir = atom.project.getPaths()[0];
    console.log(`running on ${dir}`);
    transform(dir).then(() => {
      console.log('done!');
    }, err => {
      console.log('err:', err);
    }).catch(err => {
      console.log('caught err:', err);
    });
  },

  toggle() {
    this.transform();
  },
};
