//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import download from 'download';
import url from 'url';
import get from 'lodash.get';

import { log } from './log';

// Directory inside `cwd` in which bot packages are downloaded and extracted.
export const BOT_PACKAGE_DOWNLOAD_DIR = 'out/bots';

// File inside local bot folder to run.
export const LOCAL_BOT_MAIN_FILE = 'src/main.js';

// Binary file inside downloaded bot package to run.
export const NATIVE_BOT_MAIN_FILE = 'main.bin';

// Js file inside Node.js bot package.
export const NODE_BOT_MAIN_FILE = 'main.js';

// Supported environments.
export const NATIVE_ENV = 'native';
export const NODE_ENV = 'node';

// Command to spawn to run a bot in local development mode.
export const LOCAL_BOT_RUN_COMMAND = 'yarn';

// Fixed arguments to pass to LOCAL_BOT_RUN_COMMAND.
export const LOCAL_BOT_RUN_ARGS = ['--silent', 'babel-watch', '--use-polling'];

const DOWNLOAD_TIMEOUT = 40000;

/**
 * Get platform info.
 */
export const getPlatformInfo = () => {
  let platform = os.type().toLowerCase();
  platform = (platform === 'darwin' ? 'macos' : platform);

  const arch = os.arch();

  return { platform, arch };
};

export const getBotCID = (botRecord, env) => {
  let packageAttrName;
  switch (env) {
    case NATIVE_ENV: {
      const { platform, arch } = getPlatformInfo();
      packageAttrName = `${platform}.${arch}["/"]`;
      break;
    }
    case NODE_ENV: {
      packageAttrName = 'node["/"]';
      break;
    }
    default: {
      throw new Error(`Environment '${env}' not supported.`);
    }
  }
  const ipfsCID = get(botRecord, `attributes.package.${packageAttrName}`);
  assert(ipfsCID, `Package '${packageAttrName}' not found.`);

  return ipfsCID;
};

export const removeSourceFiles = async () => {
  await fs.remove(BOT_PACKAGE_DOWNLOAD_DIR);
};

export class SourceManager {
  constructor (config) {
    this._config = config;

    this._localDev = this._config.get('bot.localDev');
  }

  /**
   * Get the install directory and executable file paths for the bot.
   * Downloads the bot to the expected path/directory if required.
   * @param {string} id
   * @param {string} ipfsCID
   * @param {string} env
   * @param {object} options
   */
  async getBotPathInfo (id, ipfsCID, env, options) {
    // Local bot development mode, bypasses WNS/IPFS.
    if (this._localDev) {
      return {
        installDirectory: process.cwd(),
        file: LOCAL_BOT_MAIN_FILE
      };
    }

    const installDirectory = path.join(process.cwd(), BOT_PACKAGE_DOWNLOAD_DIR, id);
    if (!fs.existsSync(installDirectory)) {
      await this._downloadBot(installDirectory, ipfsCID, options);
    }

    let mainFile;
    switch (env) {
      case NATIVE_ENV: {
        mainFile = NATIVE_BOT_MAIN_FILE;
        break;
      }
      case NODE_ENV: {
        mainFile = NODE_BOT_MAIN_FILE;
        break;
      }
      default: {
        throw new Error(`Environment '${env}' not supported.`);
      }
    }

    return {
      installDirectory,
      file: path.join(installDirectory, mainFile)
    };
  }

  /**
   * Download the bot package from IPFS.
   * @param {string} baseDirectory
   * @param {string} ipfsCID
   * @param {object} options
   */
  async _downloadBot (baseDirectory, ipfsCID, { ipfsEndpoint }) {
    assert(baseDirectory);
    assert(ipfsCID);

    if (!ipfsEndpoint) {
      ipfsEndpoint = this._config.get('services.ipfs.gateway');
    }
    assert(ipfsEndpoint, 'Invalid IPFS Gateway.');

    if (!ipfsEndpoint.endsWith('/')) {
      ipfsEndpoint = `${ipfsEndpoint}/`;
    }
    // eslint-disable-next-line node/no-deprecated-api
    const botPackageUrl = url.resolve(ipfsEndpoint, ipfsCID);
    log(`Downloading bot package: ${botPackageUrl}`);
    await fs.ensureDir(baseDirectory);
    try {
      await download(botPackageUrl, baseDirectory, { extract: true, timeout: DOWNLOAD_TIMEOUT });
      log(`Bot package downloaded: ${baseDirectory}`);
    } catch (err) {
      await fs.remove(baseDirectory);
      throw err;
    }
  }

  /**
   * Get process command (to spawn).
   * @param {object} botPathInfo
   * @param {string} env
   */
  getCommand (botPathInfo, env) {
    const { file } = botPathInfo;

    let command;
    let args = [];

    if (this._localDev) {
      command = LOCAL_BOT_RUN_COMMAND;
      args = LOCAL_BOT_RUN_ARGS.concat([file]);
    } else {
      switch (env) {
        case NATIVE_ENV: {
          command = file;
          break;
        }
        case NODE_ENV: {
          command = 'node';
          args = [file];
          break;
        }
        default: {
          throw new Error(`Environment '${env}' not supported.`);
        }
      }
    }

    return { command, args };
  }
}
