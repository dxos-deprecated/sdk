//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { keyPair } from 'hypercore-crypto';

import { promiseTimeout } from '@dxos/async';
import { logs } from '@dxos/debug';

import {
  BotPlugin,
  createSpawnCommand,
  createStatusCommand,
  createInvitationCommand,
  createBotManagementCommand,
  createResetCommand,
  createStopCommand,
  createBotCommand
} from '@dxos/protocol-plugin-bot';

import { keyToBuffer } from '@dxos/crypto';
import { transportProtocolProvider } from '@dxos/network-manager';

const { log } = logs('botkit-client');

const CONNECT_TIMEOUT = 30000;

/**
 * BotFactory Client.
 */
export class BotFactoryClient {
  /**
   * Constructor
   * @param {NetworkManager} networkManager
   * @param {String} botFactoryTopic
   */
  constructor (networkManager, botFactoryTopic) {
    assert(botFactoryTopic);
    assert(networkManager);

    this._botFactoryTopic = keyToBuffer(botFactoryTopic);
    // BotFactory PeerId is the same as Topic.
    this._botFactoryPeerId = keyToBuffer(botFactoryTopic);
    this._networkManager = networkManager;

    this._peerId = keyPair().publicKey;
    this._botPlugin = new BotPlugin(this._peerId, () => {});

    this._connected = false;
  }

  /**
   * Send request for bot spawning.
   * @param {String} botName
   * @param {Object} options
   */
  async sendSpawnRequest (botName, options) {
    if (!this._connected) {
      await this._connect();
    }

    log(`Sending spawn request for bot ${botName}`);
    const spawnResponse = await this._botPlugin.sendCommand(this._botFactoryTopic,
      createSpawnCommand(botName, options));

    assert(spawnResponse, `Unable to spawn bot ${botName}`);

    const { message: { botId } } = spawnResponse;

    return botId;
  }

  async sendBotManagementRequest (botId, command) {
    if (!this._connected) {
      await this._connect();
    }

    assert(botId, 'Invalid Bot Id');
    assert(command, 'Invalid command');

    const response =
      await this._botPlugin.sendCommand(this._botFactoryTopic, createBotManagementCommand(botId, command));
    const { message: { error } } = response;

    if (error) {
      throw new Error(error);
    }
  }

  /**
   * Send request for bot invitation.
   * @param {String} botId
   * @param {String} partyToJoin
   * @param {Object} spec
   * @param {Object} invitation
   */
  async sendInvitationRequest (botId, partyToJoin, spec, invitation) {
    if (!this._connected) {
      await this._connect();
    }

    log(`Sending spawn request for party: ${partyToJoin} with invitation id: ${invitation}`);
    const invitationResponse = await this._botPlugin.sendCommand(this._botFactoryTopic,
      createInvitationCommand(botId, keyToBuffer(partyToJoin), JSON.stringify(spec), JSON.stringify(invitation)));
    const { message: { error } } = invitationResponse;

    if (error) {
      throw new Error(error);
    }
  }

  async sendResetRequest (source = false) {
    if (!this._connected) {
      await this._connect();
    }

    log('Sending reset request.');
    const response = await this._botPlugin.sendCommand(this._botFactoryTopic, createResetCommand(source));
    const { message: { error } } = response;

    if (error) {
      throw new Error(error);
    }
  }

  async sendStopRequest (code = 0) {
    if (!this._connected) {
      await this._connect();
    }

    log('Sending stop request.');
    await this._botPlugin.sendCommand(this._botFactoryTopic, createStopCommand(code.toString()), true);
  }

  async getStatus () {
    try {
      if (!this._connected) {
        await this._connect();
      }

      const status = await this._botPlugin.sendCommand(this._botFactoryTopic, createStatusCommand());
      // TODO(egorgripasov): Use dxos/codec function.
      const { message: { __type_url, ...data } } = status; // eslint-disable-line camelcase
      return { started: true, ...data };
    } catch (err) {
      log(err);
      return { started: false };
    }
  }

  async sendBotCommand (botId, command) {
    if (!this._connected) {
      await this._connect();
    }

    return this._botPlugin.sendCommand(this._botFactoryTopic, createBotCommand(botId, command));
  }

  /**
   * Close network resources.
   */
  async close () {
    await this._networkManager.leaveProtocolSwarm(this._botFactoryTopic);
  }

  /**
   * Connect to BotFactory.
   */
  async _connect () {
    const connect = new Promise(resolve => {
      // TODO(egorgripasov): Factor out.
      this._botPlugin.on('peer:joined', peerId => {
        if (peerId.equals(this._botFactoryPeerId)) {
          log('Bot factory peer connected');
          this._connected = true;
          resolve();
        }
      });
    });

    await this._networkManager.joinProtocolSwarm(this._botFactoryTopic,
      transportProtocolProvider(this._botFactoryTopic, this._peerId, this._botPlugin));

    return promiseTimeout(connect, CONNECT_TIMEOUT);
  }
}
