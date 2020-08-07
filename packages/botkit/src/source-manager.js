//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import download from 'download';
import fs from 'fs-extra';
import deepGet from 'lodash.get';
import os from 'os';
import path from 'path';
import url from 'url';

import { log } from './log';

// Directory inside `cwd` in which bot packages are downloaded and extracted.
export const BOT_PACKAGE_DOWNLOAD_DIR = 'out/bots';

// File inside local bot folder to run.
export const LOCAL_BOT_MAIN_FILE = 'src/main.js';

// Binary file inside downloaded bot package to run.
export const BOT_MAIN_FILE = 'main.bin';

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

export class SourceManager {
  constructor (config) {
    this._config = config;

    this._localDev = this._config.get('bot.localDev');
  }

  /**
   * Get the install directory and executable file paths for the botId (WRN).
   * Downloads the bot to the expected path/directory if required.
   * @param {object} botRecord
   */
  async getBotPathInfo (botRecord) {
    // Local bot development mode, bypasses WNS/IPFS.
    if (this._localDev) {
      return {
        installDirectory: process.cwd(),
        file: LOCAL_BOT_MAIN_FILE
      };
    }

    const { id, attributes } = botRecord;
    const { platform, arch } = getPlatformInfo();
    const packageAttrName = `${platform}.${arch}`;

    const ipfsArtifactCID = deepGet(attributes.package || false, packageAttrName);
    if (!ipfsArtifactCID) {
      throw new Error(`Package '${packageAttrName}' not found for bot '${id}'.`);
    }

    const installDirectory = path.join(process.cwd(), BOT_PACKAGE_DOWNLOAD_DIR, id);
    if (!fs.existsSync(installDirectory)) {
      await this._downloadBot(installDirectory, ipfsArtifactCID);
    }

    return {
      installDirectory,
      file: path.join(installDirectory, BOT_MAIN_FILE)
    };
  }

  /**
   * Download the bot package from IPFS.
   * @param {string} baseDirectory
   * @param {string} ipfsCID
   */
  async _downloadBot (baseDirectory, ipfsCID) {
    assert(baseDirectory);
    assert(ipfsCID);

    let ipfsEndpoint = this._config.get('services.ipfs.gateway');
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
}
