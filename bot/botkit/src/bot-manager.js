//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { Chance } from 'chance';
import debug from 'debug';
import fs, { ensureFileSync } from 'fs-extra';
import yaml from 'js-yaml';
import get from 'lodash.get';
import path from 'path';

import { keyToString, keyToBuffer, createKeyPair, sha256 } from '@dxos/crypto';
import { transportProtocolProvider } from '@dxos/network-manager';
import {
  COMMAND_SIGN,
  MESSAGE_CONFIRM,
  BOT_EVENT,
  BotPlugin,
  createInvitationMessage,
  createSignResponse,
  createBotCommand
} from '@dxos/protocol-plugin-bot';
import { Registry } from '@wirelineio/registry-client';

import { BOT_CONFIG_FILENAME } from './config';
import { NATIVE_ENV, getBotCID } from './env';
import { log } from './log';

const chance = new Chance();

const logInfo = debug('dxos:botkit');

// File where information about running bots is stored.
export const BOTS_DUMP_FILE = 'out/factory-state';

export class BotManager {
  /**
   * @type {Map<String, {botId: String, id: String, parties: Array, started: Object, lastActive: Object, stopped: Boolean, name: String}>}
   */
  _bots = new Map();

  // TODO(egorgripasov): Merge to _bots.
  _connectedBots = {};

  constructor (config, botContainer, client, options) {
    this._config = config;
    this._botContainer = botContainer;
    this._client = client;

    const { signChallenge, emitBotEvent } = options;
    this._signChallenge = signChallenge;
    this._emitBotEvent = emitBotEvent;

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

    this._controlTopic = createKeyPair().publicKey;
    this._controlPeerKey = this._controlTopic;
  }

  get controlTopic () {
    return this._controlTopic;
  }

  async start () {
    this._plugin = new BotPlugin(this._controlPeerKey, (...args) => this._botMessageHandler(...args));
    // Join control swarm.
    this._leaveControlSwarm = await this._client.networkManager.joinProtocolSwarm(this._controlTopic,
      transportProtocolProvider(this._controlTopic, this._controlPeerKey, this._plugin));

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
    assert(botName || ipfsCID || this._localDev);

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

    log(`Spawn bot request for ${botName || ipfsCID || displayName}`);

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

    await this._plugin.sendCommand(keyToBuffer(botId), createInvitationMessage(topic, JSON.parse(invitation)));
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
    await this._leaveControlSwarm();
  }

  // TODO(egorgripasov): Merge to _bots.
  botReady (botId) {
    return this._connectedBots[botId] || false;
  }

  async sendDirectBotCommand (botId, command) {
    if (!this._bots.has(botId)) {
      throw new Error(`Bot ${botId} does not exist.`);
    }
    return this._plugin.sendCommand(keyToBuffer(botId), createBotCommand(botId, command));
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

  /**
   * Handle incoming messages from bot processes.
   * @param {Protocol} protocol
   * @param {{ message }} command.
   */
  async _botMessageHandler (protocol, { message }) {
    let result;
    switch (message.__type_url) {
      case COMMAND_SIGN: {
        result = createSignResponse(this._signChallenge(message.message));
        break;
      }

      case MESSAGE_CONFIRM: {
        const { botId } = message;
        this._connectedBots[botId] = true;
        break;
      }

      // Arbitrary event from bot.
      case BOT_EVENT: {
        await this._emitBotEvent(message);
        break;
      }

      default: {
        log('Unknown command:', message);
      }
    }

    return result;
  }

  async _getBotRecord (botName) {
    if (this._localDev) {
      let name;
      try {
        const botInfo = yaml.load(
          await fs.readFile(path.join(process.cwd(), BOT_CONFIG_FILENAME))
        );
        name = botInfo.name;
      } catch (err) {
        name = chance.animal();
      }
      return { attributes: { name }, id: sha256(name) };
    }
    const { records } = await this._registry.resolveNames([botName]);
    if (!records.length) {
      log(`Bot not found: ${botName}.`);
      throw new Error(`Invalid bot: ${botName}`);
    }
    return records[0];
  }
}
