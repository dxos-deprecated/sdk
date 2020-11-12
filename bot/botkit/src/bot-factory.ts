//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { sync as readPackageJson } from 'read-pkg-up';

import { waitForCondition } from '@dxos/async';
import { Client } from '@dxos/client';
import { keyToBuffer, keyToString, sign } from '@dxos/crypto';
import { transportProtocolProvider } from '@dxos/network-manager';
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

import { BotManager } from './bot-manager';
import { getClientConfig } from './config';
import { getPlatformInfo } from './env';
import { log } from './log';
import { BotContainer } from './bot-container';

// TODO(egorgripasov): Proper version from corresponding .yml file.
const { version } = readPackageJson() as any;

const BOT_SPAWN_TIMEOUT = 50000;
const BOT_SPAWN_CHECK_INTERVAL = 50;

/**
 * Bot factory.
 */
export class BotFactory {

  private readonly _config: any;
  private readonly _topic: Buffer;
  private readonly _peerKey: Buffer;
  private readonly _plugin: any;
  private readonly _localDev: boolean;
  private readonly _botContainer: BotContainer;
  private readonly _platorm: string;
  private _client?: Client;
  private _botManager?: BotManager;
  private _leaveSwarm?: () => void;

  constructor (config: any, botContainer: BotContainer) {
    assert(config);

    this._config = config;
    this._topic = keyToBuffer(this._config.get('bot.topic'));
    // For simplicity of communication with BotFactory assume its PeerId is the same as topic.
    this._peerKey = this._topic;
    this._plugin = new BotPlugin(this._peerKey, (protocol: any, message: any) => this.handleMessage(protocol, message));
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
    this._client = new Client({
      swarm: getClientConfig(this._config).swarm
    });
    await this._client.initialize();

    this._botManager = new BotManager(this._config, this._botContainer, this._client, {
      signChallenge: this.signChallenge.bind(this),
      emitBotEvent: this.emitBotEvent.bind(this)
    });

    await this._botContainer.start({ controlTopic: this._botManager.controlTopic });
    await this._botManager.start();

    this._leaveSwarm = await this._client.networkManager.joinProtocolSwarm(this._topic,
      transportProtocolProvider(this._topic, this._peerKey, this._plugin)) as any;

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
   */
  async handleMessage (protocol: any, { message }: any) {
    log(`Received command: ${JSON.stringify(message)}`);

    let runCommand;

    switch (message.__type_url) {
      case COMMAND_SPAWN: {
        try {
          const { botName, options } = message;
          const botId = await this._botManager!.spawnBot(botName, options);
          // TODO(egorgripasov): Move down.
          await waitForCondition(() => this._botManager!.botReady(botId), BOT_SPAWN_TIMEOUT, BOT_SPAWN_CHECK_INTERVAL);
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
            case 'start': return this._botManager!.startBot(botId);
            case 'stop': return this._botManager!.stopBot(botId);
            case 'restart': return this._botManager!.restartBot(botId);
            case 'kill': return this._botManager!.killBot(botId);
            default: break;
          }
        };
        break;
      }

      case COMMAND_RESET: {
        const { source } = message;
        runCommand = async () => {
          await this._botManager!.killAllBots();
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
          await this._botManager!.getStatus()
        );
      }

      case BOT_COMMAND: {
        const { botId, command } = message;
        try {
          const result = await this._botManager!.sendDirectBotCommand(botId, command);
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
      let error: any = {};
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
   */
  async inviteBot (botId: string, botConfig: any) {
    assert(botId);
    assert(botConfig);

    const { topic, invitation } = botConfig;

    assert(topic);
    log(`Invite bot request for '${botId}': ${JSON.stringify(botConfig)}`);

    await this._botManager!.inviteBot(botId, topic, invitation);
  }

  async stop () {
    await this._leaveSwarm?.();
    await this._botManager!.stop();
    await this._botContainer.stop();
    await this._client!.networkManager.close();
  }

  signChallenge (challenge: Buffer) {
    return sign(challenge, keyToBuffer(this._config.get('bot.secretKey')));
  }

  async emitBotEvent (message: any) {
    const { botId, type, data } = message;
    await this._plugin.broadcastCommand(createEvent(botId, type, data));
  }
}