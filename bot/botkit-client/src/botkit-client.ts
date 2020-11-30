//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { keyPair } from 'hypercore-crypto';

import { keyToBuffer } from '@dxos/crypto';
import { logs } from '@dxos/debug';
import { NetworkManager, transportProtocolProvider } from '@dxos/network-manager';
import {
  BotPlugin,
  createSpawnCommand,
  createStatusCommand,
  createInvitationCommand,
  createBotManagementCommand,
  createResetCommand,
  createStopCommand,
  createBotCommand,
  Spawn,
  BotCommandResponse
} from '@dxos/protocol-plugin-bot';
import { runWithTimeout } from '@dxos/async';

const { log } = logs('botkit-client');

const CONNECT_TIMEOUT = 30000;

/**
 * BotFactory Client.
 */
export class BotFactoryClient {
  _botFactoryTopic: Buffer;
  _botFactoryPeerId: Buffer;
  _networkManager: NetworkManager;
  _peerId: Buffer;
  _botPlugin: BotPlugin;
  _connected: Boolean;

  constructor (networkManager: NetworkManager, botFactoryTopic: string) {
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
   */
  async sendSpawnRequest (botName: string | undefined, options: Spawn.SpawnOptions) {
    if (!this._connected) {
      await this._connect();
    }

    log(`Sending spawn request for bot ${botName}`);
    const spawnResponse = await this._botPlugin.sendCommand(this._botFactoryTopic, createSpawnCommand(botName, options));

    assert(spawnResponse, `Unable to spawn bot ${botName}`);
    // eslint-disable-next-line camelcase
    assert(spawnResponse.message?.__type_url === 'dxos.protocol.bot.SpawnResponse', 'Invalid response type');

    const { message: { botId } } = spawnResponse;

    return botId;
  }

  async sendBotManagementRequest (botId: string, command: string) {
    if (!this._connected) {
      await this._connect();
    }

    assert(botId, 'Invalid Bot Id');
    assert(command, 'Invalid command');

    const response =
      await this._botPlugin.sendCommand(this._botFactoryTopic, createBotManagementCommand(botId, command));
    // eslint-disable-next-line camelcase
    assert(response?.message?.__type_url === 'dxos.protocol.bot.CommandResponse', 'Invalid response type');
    const { message: { error } } = response;

    if (error) {
      throw new Error(error);
    }
  }

  /**
   * Send request for bot invitation.
   */
  async sendInvitationRequest (botId: string, partyToJoin: string, spec: Object, invitation: Object) {
    if (!this._connected) {
      await this._connect();
    }

    log(`Sending spawn request for party: ${partyToJoin} with invitation id: ${invitation}`);
    const invitationResponse = await this._botPlugin.sendCommand(this._botFactoryTopic,
      createInvitationCommand(botId, keyToBuffer(partyToJoin), JSON.stringify(spec), JSON.stringify(invitation)));
    // eslint-disable-next-line camelcase
    assert(invitationResponse?.message?.__type_url === 'dxos.protocol.bot.CommandResponse', 'Invalid response type');
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
    // eslint-disable-next-line camelcase
    assert(response?.message?.__type_url === 'dxos.protocol.bot.CommandResponse', 'Invalid response type');
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
      assert(status?.message);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { message: { __type_url, ...data } } = status; // eslint-disable-line camelcase
      return { started: true, ...data };
    } catch (err) {
      log(err);
      return { started: false };
    }
  }

  async sendBotCommand (botId: string, command: Buffer): Promise<{ message: BotCommandResponse; }> {
    if (!this._connected) {
      await this._connect();
    }

    const response = await this._botPlugin.sendCommand(this._botFactoryTopic, createBotCommand(botId, command));
    // eslint-disable-next-line camelcase
    assert(response?.message?.__type_url === 'dxos.protocol.bot.BotCommandResponse');
    return { message: response.message };
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
    await runWithTimeout(async () => {
      const promise = this._botPlugin.waitForConnection(this._botFactoryPeerId);
      await this._networkManager.joinProtocolSwarm(this._botFactoryTopic,
        transportProtocolProvider(this._botFactoryTopic, this._peerId, this._botPlugin));
      await promise;
      this._connected = true;
    }, CONNECT_TIMEOUT, new Error(`Failed to connect to bot factory: Timed out in ${CONNECT_TIMEOUT}ms.`));
  }
}
