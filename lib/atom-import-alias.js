'use babel';

import AtomImportAliasView from './atom-import-alias-view'; // @view
import { CompositeDisposable } from 'atom';
import { transform, ignore } from 'import-alias';
// import foo from './foo'; // @foo

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

  atomImportAliasView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log('activated');
    // figre out what dirs we want to watch
    const dir = atom.project.getDirectories()[0];

    const allDirs = getDirectoriesRecursively(dir);
    allDirs.map(dir => console.log(dir.getPath()));

    // find all subdirectories
    // dir.getEntries((err, entries) => {
    //   entries
    //     .filter(entry => entry.isDirectory())
    //     .map(directory => {
    //       console.log(`adding watch to ${directory.getBaseName()}`);
    //       directory.onDidChange(() => {
    //         console.log(`${directory.getBaseName()} changed`);
    //         this.transform();
    //       });
    //     });
    // })
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
