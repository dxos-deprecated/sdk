//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import fs from 'fs-extra';
import jsondown from 'jsondown';
import ram from 'random-access-memory';
import path from 'path';
import EventEmitter from 'events';

import { randomBytes, keyToBuffer, keyToString } from '@dxos/crypto';
import { Keyring, KeyStore, KeyType } from '@dxos/credentials';
import { createClient } from '@dxos/client';

import { InvitationDescriptor } from '@dxos/party-manager';
import { createStorage, STORAGE_NODE } from '@dxos/random-access-multi-storage';

import { getClientConfig } from './config';
import { COMMAND_INVITE, startIPCClient, createSignCommand } from './ipc';

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

    const { uid, persistent = true, restarted = false, cwd, name } = config.get('bot');

    this._uid = uid;
    this._persistent = persistent;
    this._restarted = restarted;
    this._cwd = cwd;
    this._name = name;

    this._options = options;
    this._config = config;
  }

  /**
   * Start the bot.
   */
  async start () {
    this._ipcClient = await startIPCClient(this._config, this._botMessageHandler.bind(this));

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

    if (!this._restarted || !this._persistent) {
      await this._keyRing.createKeyRecord({ type: KeyType.IDENTITY });
    }

    log('Starting.');
    this._client = await createClient(feedStorage, this._keyRing, getClientConfig(this._config));

    if (!this._restarted || !this._persistent) {
      await this._client.partyManager.identityManager.initializeForNewIdentity({
        identityDisplayName: this._name,
        deviceDisplayName: this._name
      });
      log(`Identity initialized: ${this._client.partyManager.identityManager.publicKey}`);
    }

    // Parties joined during current session.
    this._client.partyManager.on('party', topic => {
      const partyKey = keyToString(topic);
      if (!this._parties.has(partyKey)) {
        this._parties.add(partyKey);
        this.emit('party', partyKey);
      }
    });

    this._ipcClient.confirmConnection();

    const parties = this._client.partyManager._parties;

    // Parties restored after restart.
    if (parties.size > 1) {
      await Promise.all([...parties.keys()].map(async topic => {
        if (!this._parties.has(topic)) {
          this._parties.add(topic);
          await this._client.partyManager.openParty(keyToBuffer(topic));
          this.emit('party', topic);
        }
      }));
    }
  }

  /**
   * Handle incoming messages from bot factory process.
   * @param {Object} command
   */
  async _botMessageHandler (command) {
    let result;
    switch (command.__type_url) {
      case COMMAND_INVITE: {
        const { topic, invitation } = command;
        await this._joinParty(topic, invitation);
        break;
      }

      default: {
        log('Unknown command:', command);
      }
    }

    return result;
  }

  async _joinParty (topic, invitation) {
    if (invitation) {
      const secretProvider = async () => {
        log('secretProvider begin.');
        const message = randomBytes(32);
        const { signature } = await this._ipcClient.sendMessage(createSignCommand(message), { waitForResponse: true });
        const secret = Buffer.alloc(signature.length + message.length);
        signature.copy(secret);
        message.copy(secret, signature.length);
        log('secretProvider end.');
        return secret;
      };

      log(`Joining party with invitation: ${JSON.stringify(invitation)}`);
      await this._client.partyManager.joinParty(InvitationDescriptor.fromQueryParameters(invitation),
        secretProvider);
    }

    // TODO(dboreham): This probably isn't necessary/doesn't work.
    await this._client.partyManager.openParty(keyToBuffer(topic));
  }
}
