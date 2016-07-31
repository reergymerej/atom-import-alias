'use babel';

import { CompositeDisposable } from 'atom';
import { transform, ignore } from 'import-alias';
import * as watcher from './watcher'; // @watcher

const ignoredDirs = ['node_modules', '.git'];

ignore(ignoredDirs);

export default {
  config: {
    watchDirectories: {
      type: 'boolean',
      default: true,
      title: 'Watch Directories',
      description: 'Run automatically when directories change.',
    },
  },

  activate() {

    const watchDirectories = atom.config.get('atom-import-alias.watchDirectories');
    console.log('Should we add watches immediately?', watchDirectories);

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-import-alias:transform': () => this.toggle(),
    }));

    this.subscriptions.add(
      atom.config.onDidChange('atom-import-alias',
        this.handleConfigChanged.bind(this))
    );

    if (watchDirectories) {
      watcher.onDirsChanged(() => {
        this.transform();
      })
    }
  },

  handleConfigChanged(changes) {
    const {oldValue, newValue} = changes;
    console.log('changed config...', oldValue, newValue);
    if (newValue.watchDirectories !== oldValue.watchDirectories) {
      if (newValue.watchDirectories) {
        console.log('start watching');
      } else {
        console.log('stop watching');
      }
    }
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
