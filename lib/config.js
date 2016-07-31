'use babel';

// @alias config

export default {
  watchDirectories: {
    type: 'boolean',
    default: true,
    title: 'Watch Directories',
    description: 'Run automatically when directories change.',
  },

  ignoredDirs: {
    type: 'array',
    default: ['node_modules', '.git'],
    items: {
      type: 'string',
    },
    title: 'Ignored Directories',
    description: 'Paths that contain one of these will be excluded.',
  },
};
