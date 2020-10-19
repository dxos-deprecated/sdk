//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import fs from 'fs-extra';
import jsondown from 'jsondown';
import ram from 'random-access-memory';
import path from 'path';
import EventEmitter from 'events';

import { promiseTimeout } from '@dxos/async';
import { randomBytes, keyToBuffer, keyToString, createKeyPair } from '@dxos/crypto';
import { Keyring, KeyStore } from '@dxos/credentials';
import { Client } from '@dxos/client';
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

import { InvitationDescriptor } from '@dxos/party-manager';
import { createStorage, STORAGE_NODE } from '@dxos/random-access-multi-storage';

import { getClientConfig } from './config';

const CONNECT_TIMEOUT = 30000;

const log = debug('dxos:botkit');

export const BOT_STORAGE = '/data';

/**
 * Base class for bots.
 */
export class Bot extends EventEmitter {
  /**
   * @type {Set}
   */
  _parties = new Set();

  /**
   * @constructor
   * @param {Object} config
   * @param {Object} options
   */
  constructor (config, options = {}) {
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
   * Start the bot.
   */
  async start () {
    this._plugin = new BotPlugin(this._controlPeerKey, (...args) => this._botMessageHandler(...args));

    let feedStorage;
    if (this._persistent) {
      const storagePath = path.join(this._cwd, BOT_STORAGE);
      await fs.ensureDir(storagePath);

      feedStorage = createStorage(storagePath, STORAGE_NODE);
      this._keyRing = new Keyring(new KeyStore(jsondown(`${storagePath}/keystore`)));
      await this._keyRing.load();
    } else {
      feedStorage = ram;
      this._keyRing = new Keyring();
    }

    log('Starting.');

    this._client = new Client({
      storage: feedStorage,
      swarm: getClientConfig(this._config).swarm,
      keyring: this._keyRing
    });
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
    await this._leaveControlSwarm();
  }

  async botCommandHandler () {

  }

  async emitBotEvent (type, data) {
    await this._plugin.sendCommand(this._botFactoryPeerKey, createEvent(this._uid, type, data));
  }

  /**
   * Handle incoming messages from bot factory process.
   * @param {Protocol} protocol
   * @param {{ message }} command.
   */
  async _botMessageHandler (protocol, { message }) {
    let result;
    switch (message.__type_url) {
      case COMMAND_BOT_INVITE: {
        const { topic, invitation } = message;
        await this._joinParty(topic, invitation);
        break;
      }

      case BOT_COMMAND: {
        const { command } = message;
        try {
          const data = await this.botCommandHandler(command);
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

  async _joinParty (topic, invitation) {
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

      const party = await this._client.echo.joinParty(InvitationDescriptor.fromQueryParameters(invitation), secretProvider);
      await party.open();
    }
  }

  _onJoin (parties = []) {
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
      this._plugin.on('peer:joined', peerId => {
        if (peerId.equals(this._botFactoryPeerKey)) {
          log('Bot factory peer connected');
          resolve();
        }
      });
    });

    this._leaveControlSwarm = await this._client.networkManager.joinProtocolSwarm(this._controlTopic,
      transportProtocolProvider(this._controlTopic, this._controlPeerKey, this._plugin));

    return promiseTimeout(connect, CONNECT_TIMEOUT);
  }
}
