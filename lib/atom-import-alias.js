'use babel';

import { CompositeDisposable } from 'atom';
import { transform, ignore } from 'import-alias';
import * as watcher from './watcher'; // @watcher
import config from './config'; // @config

const configChangeDebounce = 500;
let configTimeout;

function setIgnoredDirs(dirs) {
  ignore(dirs);
  watcher.ignore(dirs);
}

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

export default {
  config,

  activate() {
    const watchDirectories = atom.config.get('atom-import-alias.watchDirectories');

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add([
      atom.commands.add('atom-workspace', {
        'atom-import-alias:transform': () => this.toggle(),
        'atom-import-alias:toggleWatch': () => this.toggleWatch(),
      }),

      atom.config.onDidChange('atom-import-alias',
        this.onConfigDidChange.bind(this)),
    ]);

    setIgnoredDirs(atom.config.get('atom-import-alias.ignoredDirs'));

    if (watchDirectories) {
      watcher.startWatching(this.transform.bind(this));
    }
  },

  toggleWatch() {
      const path = 'atom-import-alias.watchDirectories';
      const watch = atom.config.get(path);
      atom.config.set(path, !watch)
  },

  // This is triggered when Atom thinks a config changed.
  onConfigDidChange(changes) {
    const {oldValue, newValue} = changes;
    const changedConfigs = getChangedConfigs(oldValue, newValue);

    clearTimeout(configTimeout);
    configTimeout = setTimeout(() => {
      this.handleNewConfig(changedConfigs);
    }, configChangeDebounce);
  },

  // Triggered after debounce with changed configs.
  handleNewConfig(config) {
    Object.keys(config).map(key => {
      const value = config[key];

      switch (key) {
        case 'watchDirectories':
          if (value) {
            watcher.startWatching(this.transform.bind(this));
          } else {
            watcher.stopWatching();
          }
          break;
        case 'ignoredDirs':
          setIgnoredDirs(value);
          break;
        default:
          console.log('changed not handled', key, config[key]);
      }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  transform() {
    const dir = atom.project.getPaths()[0];
    transform(dir).then(() => {
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
