//
// Copyright 2020 DXOS.org
//

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'node',

  mode: 'development',

  stats: 'errors-only',

  entry: path.resolve('./src/main.js'),

  output: {
    path: path.resolve('./out/builds/node'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },

  externals: {
    fatfs: 'fatfs',
    runtimejs: 'runtimejs',
    wrtc: 'wrtc',
    bip32: 'bip32',
    typeforce: 'typeforce'
  },

  resolve: {
    modules: ['node_modules']
  },

  plugins: [
    new webpack.IgnorePlugin(/\.\/native/),
    new webpack.IgnorePlugin(/^electron$/)
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: './dist/babel-cache/',
            // TODO(egorgripasov): Webpack does not see babel conf.
            ...JSON.parse(fs.readFileSync(path.resolve(__dirname, './.babelrc'))),
          }
        }
      },
      {
        test: /simple-websocket\/.*\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: './dist/babel-cache/',
            // TODO(egorgripasov): Webpack does not see babel conf.
            ...JSON.parse(fs.readFileSync(path.resolve(__dirname, './.babelrc')))
          }
        } 
      }
    ]
  }
};
