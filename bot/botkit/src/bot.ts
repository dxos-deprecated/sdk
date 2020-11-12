//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import { EventEmitter } from 'events';
import path from 'path';

import { promiseTimeout } from '@dxos/async';
import { Client } from '@dxos/client';
import { randomBytes, keyToBuffer, keyToString, createKeyPair } from '@dxos/crypto';
import { InvitationDescriptor } from '@dxos/echo-db';
import { transportProtocolProvider } from '@dxos/network-manager';
import {
  COMMAND_BOT_INVITE,
  BOT_COMMAND,
  BotPlugin,
  createSignCommand,
  createConnectConfirmMessage,
  createBotCommandResponse,
  createEvent
} from '@dxos/protocol-plugin-bot';
import { Party } from '@dxos/echo-db';

import { getClientConfig } from './config';

const CONNECT_TIMEOUT = 30000;

const log = debug('dxos:botkit');

export const BOT_STORAGE = '/data';

/**
 * Base class for bots.
 */
export class Bot extends EventEmitter {
  private readonly _parties = new Set();
  
  private readonly _uid: string;
  private readonly _persistent: boolean;
  private readonly _restarted: boolean;
  private readonly _cwd: string;
  private readonly _name: string;
  private readonly _controlTopic: Buffer;
  private readonly _controlPeerKey: Buffer;
  private readonly _botFactoryPeerKey: Buffer;

  private readonly _options: any;
  private readonly _config: any;

  private _plugin?: any /*BotPlugin */;
  private _client?: Client;

  private _leaveControlSwarm?: () => void;

  constructor (config: any, options: any = {}) {
    super();

    const { uid, persistent = true, restarted = false, cwd, name, controlTopic } = config.get('bot');

    this._uid = uid;
    this._persistent = persistent;
    this._restarted = restarted;
    this._cwd = cwd;
    this._name = name;

    this._controlTopic = keyToBuffer(controlTopic);
    this._controlPeerKey = keyToBuffer(this._uid);
    this._botFactoryPeerKey = this._controlTopic;

    this._options = options;
    this._config = config;
  }

  /**
   * Called before `client.initialize()` useful to register custom models.
   */
  async _preInit () {}

  /**
   * Start the bot.
   */
  async start () {
    this._plugin = new BotPlugin(this._controlPeerKey, (protocol: any, message: any) => this._botMessageHandler(protocol, message));

    log('Starting.');
    this._client = new Client({
      // TODO(marik-d): ReferenceError: indexedDB is not defined.
      // storagePath: this._persistent ? path.join(this._cwd, BOT_STORAGE) : undefined,
      // storageType: this._persistent ? 'node' : 'ram',
      swarm: getClientConfig(this._config).swarm,
    });
    await this._preInit();
    await this._client.initialize();

    if (!this._restarted || !this._persistent) {
      const { publicKey, secretKey } = createKeyPair();
      await this._client.createProfile({ publicKey, secretKey, username: this._name });
      log(`Identity initialized: ${keyToString(publicKey)}`);
    }

    // Join control swarm.
    log('Joining control topic.');
    await this._connectToControlTopic();

    const parties = this._client.echo.queryParties();
    this._onJoin(parties.value);

    parties.subscribe(() => {
      this._onJoin(parties.value);
    });

    await this._plugin.sendCommand(this._botFactoryPeerKey, createConnectConfirmMessage(this._uid));
  }

  async stop () {
    await this._leaveControlSwarm?.();
  }

  async botCommandHandler (command: any): Promise<any | void> {

  }

  async emitBotEvent (type: any, data: any) {
    await this._plugin.sendCommand(this._botFactoryPeerKey, createEvent(this._uid, type, data));
  }

  /**
   * Handle incoming messages from bot factory process.
   * @param {Protocol} protocol
   * @param {{ message }} command.
   */
  async _botMessageHandler (protocol: any, { message }: { message: any }) {
    let result;
    switch (message.__type_url) {
      case COMMAND_BOT_INVITE: {
        const { invitation } = message;
        await this._joinParty(invitation);
        break;
      }

      case BOT_COMMAND: {
        const { command } = message;
        try {
          // TODO(marik-d): Support custom codecs.
          const decodedCommand = JSON.parse(command.toString()) || {};
          const result = await this.botCommandHandler(decodedCommand);
          const data = Buffer.from(JSON.stringify(result || {}));
          return createBotCommandResponse(data);
        } catch (error) {
          return createBotCommandResponse(null, error.message);
        }
      }

      default: {
        log('Unknown command:', message);
      }
    }

    return result;
  }

  async _joinParty (invitation: unknown) {
    if (invitation) {
      const secretProvider = async () => {
        log('secretProvider begin.');
        const message = randomBytes(32);
        const { message: { signature } } = await this._plugin.sendCommand(this._botFactoryPeerKey, createSignCommand(message));
        const secret = Buffer.alloc(signature.length + message.length);
        signature.copy(secret);
        message.copy(secret, signature.length);
        log('secretProvider end.');
        return secret;
      };

      log(`Joining party with invitation: ${JSON.stringify(invitation)}`);

      const party = await this._client!.echo.joinParty(InvitationDescriptor.fromQueryParameters(invitation as any), secretProvider);
      await party.open();
    }
  }

  _onJoin (parties: Party[] = []) {
    parties.map(party => {
      const topic = keyToString(party.key);
      if (!this._parties.has(topic)) {
        this._parties.add(topic);
        this.emit('party', party.key);
      }
    });
  }

  async _connectToControlTopic () {
    const connect = new Promise(resolve => {
      // TODO(egorgripasov): Factor out.
      this._plugin.on('peer:joined', (peerId: Buffer) => {
        if (peerId.equals(this._botFactoryPeerKey)) {
          log('Bot factory peer connected');
          resolve();
        }
      });
    });

    this._leaveControlSwarm = await this._client!.networkManager.joinProtocolSwarm(this._controlTopic,
      transportProtocolProvider(this._controlTopic, this._controlPeerKey, this._plugin)) as any;

    return promiseTimeout(connect, CONNECT_TIMEOUT);
  }
}
