//
// Copyright 2020 DXOS.org
//

import leveljs from 'level-js';
import memdown from 'memdown';

import { Keyring } from '@dxos/credentials';
import { humanize, keyToString } from '@dxos/crypto';
import { ECHO, InvitationOptions, SecretProvider } from '@dxos/echo-db';
import { FeedStore } from '@dxos/feed-store';
import { ModelConstructor } from '@dxos/model-factory';
import { NetworkManager, SwarmProvider } from '@dxos/network-manager';
import { createStorage } from '@dxos/random-access-multi-storage';
import { raise } from '@dxos/util';
import { Registry } from '@wirelineio/registry-client';

export interface ClientConfig {
  // TODO(burdon): Hierarchical config (also "persistent" is not a storage type.)
  storageType?: 'ram' | 'persistent' | 'idb' | 'chrome' | 'firefox' | 'node',
  storagePath?: string,
  swarm?: {
    signal?: string,
    ice?: {
      urls: string,
      username?: string,
      credential?: string,
    }[],
  },
  wns?: {
    server: string,
    chainId: string,
  },
  snapshots?: boolean
  snapshotInterval?: number
}

export interface CreateProfileOptions {
  publicKey?: Buffer
  secretKey?: Buffer
  username?: string
}

/**
 * Data client.
 */
export class Client {
  private readonly _config: ClientConfig;

  private readonly _echo: ECHO;

  private readonly _registry?: any;

  private _initialized = false;

  constructor (config: ClientConfig = {}) {
    this._config = config;
    // TODO(burdon): Make hierarchical (e.g., snapshot.[enabled, interval])
    const {
      snapshots = false,
      snapshotInterval,
      storageType = 'ram',
      storagePath = 'dxos/storage',
      swarm = DEFAULT_SWARM_CONFIG,
      wns
    } = config;

    // TODO(burdon): Extract constants.
    this._echo = new ECHO({
      feedStorage: createStorage(`${storagePath}/feeds`, storageType === 'persistent' ? undefined : storageType),
      keyStorage: storageType === 'ram' ? memdown() : leveljs(`${storagePath}/keystore`),
      snapshotStorage: snapshots
        ? createStorage(`${storagePath}/snapshots`, storageType === 'persistent' ? undefined : storageType)
        : createStorage(`${storagePath}/snapshots`, 'ram'),
      swarmProvider: new SwarmProvider(swarm),
      snapshots,
      snapshotInterval
    });

    this._registry = wns ? new Registry(wns.server, wns.chainId) : undefined;
  }

  get config (): ClientConfig {
    return this._config;
  }

  /**
   * Initializes internal resources.
   */
  async initialize () {
    if (this._initialized) {
      return;
    }

    const timeout = setTimeout(() => {
      console.error('Initialize is taking more then 10 seconds to complete. Something probably went wrong.');
    }, 10000);

    await this._echo.open();

    this._initialized = true;
    clearInterval(timeout);
  }

  /**
   * Cleanup, release resources.
   */
  async destroy () {
    await this._echo.close();
  }

  /**
   * Resets and destroys client storage.
   * Warning: Inconsistent state after reset, do not continue to use this client instance.
   */
  async reset () {
    await this._echo.reset();
  }

  /**
   * Create Profile. Add Identity key if public and secret key are provided. Then initializes profile with given username.
   * If not public and secret key are provided it relies on keyring to contain an identity key.
   * @returns {ProfileInfo} User profile info.
   */
  // TODO(burdon): Breaks if profile already exists.
  // TODO(burdon): ProfileInfo is not imported or defined.
  async createProfile ({ publicKey, secretKey, username }: CreateProfileOptions = {}) {
    // TODO(burdon): What if not set?
    if (publicKey && secretKey) {
      await this._echo.createIdentity({ publicKey, secretKey });
    }

    await this._echo.createHalo(username);

    return this.getProfile();
  }

  /**
   * @returns {ProfileInfo} User profile info.
   */
  getProfile () {
    if (!this._echo.identityKey) {
      return;
    }

    return {
      username: this._echo.identityDisplayName,
      // TODO(burdon): Why convert to string?
      publicKey: keyToString(this._echo.identityKey.publicKey)
    };
  }

  subscribeToProfile (cb: () => void): () => void {
    return this._echo.identityReady.on(cb);
  }

  /**
   * @returns true if the profile exists.
   */
  // TODO(burdon): Remove?
  hasProfile () {
    return this._echo.identityKey;
  }

  /**
   * @deprecated
   * Create a new party.
   * @return {Promise<Party>} The new Party.
   */
  async createParty () {
    return this._echo.createParty();
  }

  /**
   * @param partyKey Party publicKey
   */
  async createInvitation (partyKey: Uint8Array, secretProvider: SecretProvider, options?: InvitationOptions) {
    const party = await this.echo.getParty(partyKey) ?? raise(new Error(`Party not found ${humanize(partyKey)}`));
    return party.createInvitation({
      secretValidator: async (invitation, secret) => secret && secret.equals((invitation as any).secret), // TODO(marik-d): Probably an error here.
      secretProvider
    },
    options);
  }

  /**
   * @param {Buffer} publicKey Party publicKey
   * @param {Buffer} recipient Recipient publicKey
   */
  async createOfflineInvitation (partyKey: Uint8Array, recipientKey: Uint8Array) {
    const party = await this.echo.getParty(partyKey) ?? raise(new Error(`Party not found ${humanize(partyKey)}`));
    return party.createOfflineInvitation(recipientKey);
  }

  /**
   * Returns an Array of all known Contacts across all Parties.
   * @returns {Contact[]}
   */
  async getContacts () {
    console.warn('client.getContacts not impl. Returning []');
    // return this._partyManager.getContacts();
    return [];
  }

  /**
   * Registers a new model.
   */
  registerModel (constructor: ModelConstructor<any>): this {
    this._echo.modelFactory.registerModel(constructor);

    return this;
  }

  get echo () {
    return this._echo;
  }

  get registry () {
    return this._registry;
  }

  /**
   * For devtools.
   *
   * @deprecated Use echo.keyring
   */
  get keyring (): Keyring {
    return this._echo.keyring;
  }

  /**
   * For devtools.
   *
   * @deprecated Use echo.feedStore
   */
  get feedStore (): FeedStore {
    return this._echo.feedStore;
  }

  /**
   * For devtools.
   *
   * @deprecated Use echo.networkManager.
   */
  get networkManager (): NetworkManager {
    return this._echo.networkManager;
  }

  /**
   * @deprecated
   */
  get modelFactory () {
    console.warn('client.modelFactory is deprecated.');
    return this._echo.modelFactory;
  }
}

const DEFAULT_SWARM_CONFIG: ClientConfig['swarm'] = {
  signal: 'ws://localhost:4000',
  ice: [{ urls: 'stun:stun.wireline.ninja:3478' }]
};
