//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import ram from 'random-access-memory';
import crypto from 'hypercore-crypto';

import { waitForCondition } from '@dxos/async';
import { keyToBuffer, keyToString, discoveryKey } from '@dxos/crypto';

import {
  COMMAND_SPAWN,
  COMMAND_STATUS,
  COMMAND_INVITE,
  COMMAND_MANAGE,
  COMMAND_RESET,
  COMMAND_STOP,
  BotPlugin,
  createStatusResponse,
  createSpawnResponse,
  createCommandResponse
} from '@dxos/protocol-plugin-bot';

import { Keyring } from '@dxos/credentials';
import { createClient } from '@dxos/client';
import { transportProtocolProvider } from '@dxos/network-manager';

// TODO(egorgripasov): Proper version from corresponding .yml file.
import { version } from '../package'; // eslint-disable-line import/extensions
import { getClientConfig } from './config';
import { getPlatformInfo, removeSourceFiles } from './source-manager';
import { BotManager } from './bot-manager';

import { COMMAND_SIGN, startIPCServer, createSignResponse, createInvitationMessage } from './ipc';

import { log } from './log';

const BOT_SPAWN_TIMEOUT = 50000;
const BOT_SPAWN_CHECK_INTERVAL = 50;

/**
 * Bot factory.
 */
export class BotFactory {
  /**
   * @constructor
   * @param {object} config
   */
  constructor (config) {
    assert(config);

    this._config = config;
    this._topic = keyToBuffer(this._config.get('bot.topic'));
    // For simplicity of communication with BotFactory assume its PeerId is the same as topic.
    this._peerKey = this._topic;
    this._plugin = new BotPlugin(this._peerKey, (...args) => this.handleMessage(...args));
    this._localDev = this._config.get('bot.localDev');

    const { platform, arch } = getPlatformInfo();
    this._platorm = `${platform}.${arch}`;

    process.on('SIGINT', (...args) => {
      console.log('Signal received.', ...args);
      this._botManager.stop();
      process.exit(0);
    });
  }

  /**
   * Start factory.
   */
  async start () {
    this._ipcServer = await startIPCServer(this._config, this._botMessageHandler.bind(this));
    this._client = await createClient(ram, new Keyring(), getClientConfig(this._config), [this._plugin]);
    this._botManager = new BotManager(this._config, { ipcServerId: this._ipcServer.id, ipcServerPort: this._ipcServer.port });

    await this._botManager.start();

    await this._client.networkManager.joinProtocolSwarm(this._topic,
      transportProtocolProvider(this._topic, this._peerKey, this._plugin));

    log(JSON.stringify(
      {
        started: true,
        topic: keyToString(this._topic),
        peerId: keyToString(this._peerKey),
        localDev: this._localDev,
        ipcPort: this._ipcServer.port
      }
    ));
  }

  /**
   * Handle incoming message.
   * @param {Protocol} protocol
   * @param {{ message }} command.
   */
  async handleMessage (protocol, { message }) {
    log(`Received command: ${JSON.stringify(message)}`);

    let runCommand;

    switch (message.__type_url) {
      case COMMAND_SPAWN: {
        try {
          const { botId, options } = message;
          const botUID = await this._botManager.spawnBot(botId, options);
          await waitForCondition(() => this._ipcServer.clientConnected(botUID), BOT_SPAWN_TIMEOUT, BOT_SPAWN_CHECK_INTERVAL);
          return createSpawnResponse(botUID);
        } catch (err) {
          log(err);
          return createSpawnResponse(null);
        }
      }

      case COMMAND_INVITE: {
        runCommand = async () => this.inviteBot(message.botUID, message);
        break;
      }

      case COMMAND_MANAGE: {
        const { botUID, command } = message;
        runCommand = async () => {
          switch (command) {
            case 'start': return this._botManager.startBot(botUID);
            case 'stop': return this._botManager.stopBot(botUID);
            case 'restart': return this._botManager.restartBot(botUID);
            case 'kill': return this._botManager.killBot(botUID);
            default: break;
          }
        };
        break;
      }

      case COMMAND_RESET: {
        const { source } = message;
        runCommand = async () => {
          await this._botManager.killAllBots();
          if (source) {
            await removeSourceFiles();
          }
        };
        break;
      }

      case COMMAND_STOP: {
        const { errorCode = 0 } = message;
        process.exit(Number(errorCode));
      }

      case COMMAND_STATUS: {
        return createStatusResponse(
          version,
          this._platorm,
          Math.floor(process.uptime()).toString(),
          await this._botManager.getStatus()
        );
      }

      default: {
        log('Unknown command:', JSON.stringify(message));
      }
    }

    if (runCommand) {
      let status = 'success';
      let error = {};
      try {
        await runCommand();
      } catch (err) {
        status = 'failed';
        error = err;
      }
      return createCommandResponse(status, error.message);
    }
  }

  /**
   * Invite bot to a party.
   * @param {String} botUID
   * @param {Object} botConfig
   */
  async inviteBot (botUID, botConfig) {
    assert(botUID);
    assert(botConfig);

    const { topic, invitation } = botConfig;

    assert(topic);

    log(`Invite bot request for '${botUID}': ${JSON.stringify(botConfig)}`);

    await this._botManager.addParty(botUID, topic);

    this._ipcServer.sendMessage(botUID, createInvitationMessage(topic, JSON.parse(invitation)));
  }

  async stop () {
    this._ipcServer.stop();

    this._swarm.on('leave', async () => {
      setImmediate(async () => {
        await this._swarm.close();
      });
    });
    this._swarm.leave(discoveryKey(this._topic));
    await this._botManager.stop();
  }

  /**
   * Handle incoming messages from bot processes.
   * @param {Object} command
   */
  async _botMessageHandler (command) {
    let result;
    switch (command.__type_url) {
      case COMMAND_SIGN: {
        result = createSignResponse(
          crypto.sign(command.message, keyToBuffer(this._config.get('bot.secretKey')))
        );
        break;
      }

      default: {
        log('Unknown command:', command);
      }
    }

    return result;
  }
}
