//
// Copyright 2020 DXOS.org
//

import fs from 'fs-extra';
import path from 'path';
import webpack from 'webpack';
import tar from 'tar';
import fetch from 'node-fetch';
import debug from 'debug'

const BUILD_PATH = './out/builds/node';

const log = debug('dxos:testing:distributor')

const getWebpackConfig = botPath => {
  return {
    target: 'node',

    mode: 'development',

    stats: 'errors-only',

    entry: path.resolve(botPath),

    output: {
      path: path.resolve(BUILD_PATH),
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
      new webpack.IgnorePlugin(/(?!\.\/native-container)\.\/native/),
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
              ...JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.babelrc')))
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
              ...JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.babelrc')))
            }
          }
        }
      ]
    }
  };
};

export const buildBot = async (botPath) => {
  const webpackConf = getWebpackConfig(botPath);

  return new Promise((resolve, reject) => {
    webpack({ ...webpackConf, stats: 'errors-only' }, (err, stats) => {
      if (err /* || stats.hasErrors() */) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
};

const publishBot = async ipfsEndpoint => {
  if (!ipfsEndpoint.endsWith('/')) {
    ipfsEndpoint = `${ipfsEndpoint}/`;
  }

  const response = await fetch(ipfsEndpoint, {
    method: 'POST',
    body: tar.c({ gzip: true, C: BUILD_PATH }, ['.'])
  });

  return response.headers.get('Ipfs-Hash');
};

/**
 * @param {string} ipfsEndpoint IPFS Gateway endpoint.
 * @param {string} botPath Path to bot file from cwd.
 */
export const buildAndPublishBot = async (ipfsEndpoint, botPath) => {
  await buildBot(botPath);
  log('Bot package built');
  log(`Publishing to IPFS node: ${ipfsEndpoint}`);
  const ipfsCID = await publishBot(ipfsEndpoint);
  log(`Published: ${ipfsCID}`);
  return ipfsCID;
};
