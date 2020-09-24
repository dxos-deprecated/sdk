//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import ram from 'random-access-memory';
import crypto from 'hypercore-crypto';

import { waitForCondition } from '@dxos/async';
import { keyToBuffer, keyToString } from '@dxos/crypto';

import {
  COMMAND_SPAWN,
  COMMAND_STATUS,
  COMMAND_INVITE,
  COMMAND_MANAGE,
  COMMAND_RESET,
  COMMAND_STOP,
  BOT_COMMAND,
  BotPlugin,
  createStatusResponse,
  createSpawnResponse,
  createCommandResponse,
  createBotCommandResponse,
  createEvent
} from '@dxos/protocol-plugin-bot';

import { Keyring } from '@dxos/credentials';
import { createClient } from '@dxos/client';
import { transportProtocolProvider } from '@dxos/network-manager';

// TODO(egorgripasov): Proper version from corresponding .yml file.
import { version } from '../package'; // eslint-disable-line import/extensions
import { getClientConfig } from './config';
import { BotManager } from './bot-manager';
import { getPlatformInfo } from './env';

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
   * @param {BotContainer} botContainer
   */
  constructor (config, botContainer) {
    assert(config);

    this._config = config;
    this._topic = keyToBuffer(this._config.get('bot.topic'));
    // For simplicity of communication with BotFactory assume its PeerId is the same as topic.
    this._peerKey = this._topic;
    this._plugin = new BotPlugin(this._peerKey, (...args) => this.handleMessage(...args));
    this._localDev = this._config.get('bot.localDev');

    this._botContainer = botContainer;

    const { platform, arch } = getPlatformInfo();
    this._platorm = `${platform}.${arch}`;

    process.on('SIGINT', async (...args) => {
      log('Signal received.', ...args);
      await this.stop();
      process.exit(0);
    });
  }

  /**
   * Start factory.
   */
  async start () {
    this._client = await createClient(ram, new Keyring(), getClientConfig(this._config));
    this._botManager = new BotManager(this._config, this._botContainer, this._client, {
      signChallenge: this.signChallenge.bind(this),
      emitBotEvent: this.emitBotEvent.bind(this)
    });

    await this._botContainer.start({ controlTopic: this._botManager.controlTopic });
    await this._botManager.start();

    this._leaveSwarm = await this._client.networkManager.joinProtocolSwarm(this._topic,
      transportProtocolProvider(this._topic, this._peerKey, this._plugin));

    log(JSON.stringify(
      {
        started: true,
        topic: keyToString(this._topic),
        peerId: keyToString(this._peerKey),
        localDev: this._localDev,
        controlTopic: keyToString(this._botManager.controlTopic)
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
          const { botName, options } = message;
          const botId = await this._botManager.spawnBot(botName, options);
          // TODO(egorgripasov): Move down.
          await waitForCondition(() => this._botManager.botReady(botId), BOT_SPAWN_TIMEOUT, BOT_SPAWN_CHECK_INTERVAL);
          return createSpawnResponse(botId);
        } catch (err) {
          log(err);
          return createSpawnResponse(null);
        }
      }

      case COMMAND_INVITE: {
        runCommand = async () => this.inviteBot(message.botId, message);
        break;
      }

      case COMMAND_MANAGE: {
        const { botId, command } = message;
        runCommand = async () => {
          switch (command) {
            case 'start': return this._botManager.startBot(botId);
            case 'stop': return this._botManager.stopBot(botId);
            case 'restart': return this._botManager.restartBot(botId);
            case 'kill': return this._botManager.killBot(botId);
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
            await this._botContainer.removeSource();
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

      case BOT_COMMAND: {
        const { botId, command } = message;
        try {
          const result = await this._botManager.sendDirectBotCommand(botId, command);
          const { message: { data, error } } = result;
          return createBotCommandResponse(data, error);
        } catch (err) {
          return createBotCommandResponse(null, err.message);
        }
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
   * @param {String} botId
   * @param {Object} botConfig
   */
  async inviteBot (botId, botConfig) {
    assert(botId);
    assert(botConfig);

    const { topic, invitation } = botConfig;

    assert(topic);
    log(`Invite bot request for '${botId}': ${JSON.stringify(botConfig)}`);

    await this._botManager.inviteBot(botId, topic, invitation);
  }

  async stop () {
    await this._leaveSwarm();
    await this._botManager.stop();
    await this._botContainer.stop();
    await this._client.networkManager.close();
  }

  signChallenge (challenge) {
    return crypto.sign(challenge, keyToBuffer(this._config.get('bot.secretKey')));
  }

  async emitBotEvent (message) {
    const { botId, type, data } = message;
    await this._plugin.broadcastCommand(createEvent(botId, type, data));
  }
}
