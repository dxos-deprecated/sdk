//
// Copyright 2020 DXOS.org
//

// https://storybook.js.org/docs/configurations/custom-webpack-config/#examples

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
