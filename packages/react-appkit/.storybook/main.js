//
// Copyright 2020 DXOS.org
//

module.exports = {
  stories: ['../**/*.stories.js'],
  addons: [
    '@storybook/addon-actions/register',
    '@storybook/addon-knobs/register'
  ],
  webpackFinal: async (config, { configType }) => {
    config.node = { fs: 'empty' };
    return config;
  }
};
