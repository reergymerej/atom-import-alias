'use babel';

import { CompositeDisposable } from 'atom';
import { transform, ignore } from 'import-alias';
import * as watcher from './watcher'; // @watcher
import config from './config'; // @config

const ignoredDirs = ['node_modules', '.git'];

ignore(ignoredDirs);

export default {
  config,

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

    // What values actually changed?
    function getChangedConfigs(oldValue, newValue) {
      const changes = {};
      Object.keys(newValue).map((configKey) => {
        const newConfigValue = newValue[configKey];

        const valueChanged = Array.isArray(newConfigValue)
          ? newConfigValue.join('') !== oldValue[configKey].join('')
          : newConfigValue !== oldValue[configKey];

        if (valueChanged) {
          changes[configKey] = newConfigValue;
        }
      });

      return changes;
    }

    const changedConfigs = getChangedConfigs(oldValue, newValue);

    Object.keys(changedConfigs).map(key => {
      console.log('changed', key, changedConfigs[key]);
      const value = changedConfigs[key];

      switch (key) {
        case 'watchDirectories':
          if (value) {
            console.log('start watching');
          } else {
            console.log('stop watching');
          }
          break;
        case 'ignoredDirs':
          console.log('set new ignoredDirs', value);
          break;
        default:
      }
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
