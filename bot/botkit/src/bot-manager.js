//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import assert from 'assert';
import fs, { ensureFileSync } from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { Chance } from 'chance';
import get from 'lodash.get';

import { keyToString, createKeyPair } from '@dxos/crypto';
import { Registry } from '@wirelineio/registry-client';

import { log } from './log';
import { NATIVE_ENV, getBotCID } from './env';
import { BOT_CONFIG_FILENAME } from './config';

const chance = new Chance();

const logInfo = debug('dxos:botkit');

// File where information about running bots is stored.
export const BOTS_DUMP_FILE = 'out/factory-state';

export class BotManager {
  /**
   * @type {Map<String, {botId: String, id: String, parties: Array, started: Object, lastActive: Object, stopped: Boolean, name: String}>}
   */
  _bots = new Map();

  constructor (config, botContainer) {
    this._config = config;
    this._botContainer = botContainer;

    this._localDev = this._config.get('bot.localDev');
    this._botsFile = path.join(process.cwd(), BOTS_DUMP_FILE);

    this._registry = new Registry(this._config.get('services.wns.server'), this._config.get('services.wns.chainId'));

    ensureFileSync(this._botsFile);

    this._botContainer.on('bot-close', async (botId, code) => {
      const botInfo = this._bots.get(botId);
      if (!code && botInfo) {
        botInfo.stopped = true;
        await this._saveBotsToFile();
      }
    });
  }

  async start () {
    await this._readBotsFromFile();

    const reset = this._config.get('bot.reset');
    if (reset) {
      await this.killAllBots();
    } else {
      for await (const { botId, stopped } of this._bots.values()) {
        if (!stopped) {
          await this._startBot(botId);
        }
      }
    }
  }

  /**
   * Spawn bot instance.
   * @param {String} botName
   * @param {Object} options
   */
  async spawnBot (botName, options = {}) {
    let { ipfsCID, env = NATIVE_ENV, name: displayName, id } = options;
    assert(botName || ipfsCID);

    log(`Spawn bot request for ${botName || ipfsCID}`);

    if (!ipfsCID) {
      const botRecord = await this._getBotRecord(botName);
      if (!this._localDev) {
        ipfsCID = getBotCID(botRecord, env);
      }

      if (!displayName) {
        displayName = get(botRecord, 'attributes.name');
      }

      if (!id) {
        id = get(botRecord, 'id');
      }
    }

    assert(id, 'Invalid Bot Id.');
    assert(displayName, 'Invalid Bot Name.');

    const botId = keyToString(createKeyPair().publicKey);
    const name = `bot:${displayName} ${chance.animal()}`;

    const params = await this._botContainer.getBotAttributes(botName, botId, id, ipfsCID, env, options);

    return this._startBot(botId, { botName, env, name, ...params });
  }

  /**
   * @param {String} botId Unique Bot ID.
   */
  async stopBot (botId) {
    await this._stopBot(botId, true);
  }

  /**
   * @param {String} botId Unique Bot ID.
   */
  async killBot (botId) {
    const botInfo = this._bots.get(botId);
    assert(botInfo, 'Invalid Bot Id');

    await this._botContainer.killBot(botInfo);
    this._bots.delete(botId);
    await this._saveBotsToFile();

    log(`Bot '${botId}' removed from Bot Container.`);
  }

  async killAllBots () {
    for await (const botInfo of this._bots.values()) {
      await this._botContainer.killBot(botInfo);
    }
    this._bots.clear();
    await this._saveBotsToFile();
  }

  /**
   * @param {String} botId Unique Bot ID.
   */
  async restartBot (botId) {
    await this._stopBot(botId);
    await this._startBot(botId);
  }

  async restartBots () {
    for await (const { botId } of this._bots.values()) {
      await this.restartBot(botId);
    }
  }

  /**
   * @param {String} botId Unique Bot ID.
   */
  async startBot (botId) {
    const botInfo = this._bots.get(botId);

    assert(botInfo, 'Invalid Bot ID');
    assert(botInfo.stopped, `Bot ${botId} already running`);
    await this._startBot(botId);
  }

  /**
   * @param {String} botId Unique Bot ID.
   * @param {String} topic Party to join.
   * @param {Object} invitation Invitation.
   */
  async inviteBot (botId, topic, invitation) {
    const botInfo = this._bots.get(botId);

    assert(botInfo, 'Invalid Bot Id');
    if (botInfo.parties.indexOf(topic) === -1) {
      botInfo.parties.push(topic);
      await this._saveBotsToFile();
    }
    await this._botContainer.inviteBot(botId, topic, invitation);
  }

  async getStatus () {
    return [...this._bots.values()].map(({ started, lastActive, ...rest }) => ({
      ...rest,
      started: started ? started.format() : null,
      lastActive: lastActive ? lastActive.format() : null
    }));
  }

  async stop () {
    for await (const { botId } of this._bots.values()) {
      await this._stopBot(botId);
    }
  }

  /**
   * Start bot instance.
   * @param {String} botId
   * @param {Object} options
   */
  async _startBot (botId, options = {}) {
    let botInfo = this._bots.get(botId);
    botInfo = await this._botContainer.startBot(botId, botInfo, options);

    this._bots.set(botId, botInfo);
    await this._saveBotsToFile();

    return botId;
  }

  /**
   * @param {String} botId Unique Bot Id
   * @param {Boolean} stopped Whether bot should be marked as stopped
   */
  async _stopBot (botId, stopped = false) {
    const botInfo = this._bots.get(botId);
    assert(botInfo, 'Invalid Bot Id');

    await this._botContainer.stopBot(botInfo);

    if (stopped) {
      botInfo.stopped = true;
      await this._saveBotsToFile();
    }
    log(`Bot '${botId}' stopped.`);
  }

  async _saveBotsToFile () {
    const data = [...this._bots.values()].map(this._botContainer.serializeBot);
    await fs.writeJSON(this._botsFile, data);
  }

  async _readBotsFromFile () {
    assert(this._bots.size === 0, 'Bots already initialized.');

    let data = [];
    try {
      data = await fs.readJson(this._botsFile);
    } catch (err) {
      logInfo(err);
    }
    data.forEach(({ botId, ...rest }) => {
      this._bots.set(botId, { botId, ...rest });
    });
  }

  async _getBotRecord (botName) {
    if (this._localDev) {
      const botInfo = yaml.load(
        await fs.readFile(path.join(process.cwd(), BOT_CONFIG_FILENAME))
      );
      return { attributes: { displayName: botInfo.name }, id: botInfo.id };
    }
    const { records } = await this._registry.resolveNames([botName]);
    if (!records.length) {
      log(`Bot not found: ${botName}.`);
      throw new Error(`Invalid bot: ${botName}`);
    }
    return records[0];
  }
}
