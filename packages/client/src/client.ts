//
// Copyright 2020 DXOS.org
//

import leveljs from 'level-js';
import memdown from 'memdown';

import { Keyring, KeyStore, KeyType } from '@dxos/credentials';
import { humanize, keyToString } from '@dxos/crypto';
import {
  codec, ECHO, PartyManager, PartyFactory, FeedStoreAdapter, IdentityManager, SecretProvider, InvitationOptions, InvitationDescriptor
} from '@dxos/echo-db';
import { SnapshotStore } from '@dxos/echo-db/dist/src/snapshot-store';
import { FeedStore } from '@dxos/feed-store';
import { ModelConstructor, ModelFactory } from '@dxos/model-factory';
import { NetworkManager, SwarmProvider } from '@dxos/network-manager';
import { ObjectModel } from '@dxos/object-model';
import { createStorage } from '@dxos/random-access-multi-storage';
import { raise } from '@dxos/util';
import { Registry } from '@wirelineio/registry-client';

export interface ClientConfig {
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

  private readonly _feedStore: FeedStore;

  private readonly _keyring: Keyring;

  private readonly _swarmConfig?: any;

  private readonly _modelFactory: ModelFactory;

  private readonly _identityManager: IdentityManager;

  private readonly _networkManager: NetworkManager;

  private readonly _partyFactory: PartyFactory;

  private readonly _partyManager: PartyManager;

  private readonly _echo: ECHO;

  private readonly _registry?: any;

  private readonly _snapshotStore: SnapshotStore;

  private _initialized = false;

  constructor (config: ClientConfig = {}) {
    this._config = config;
    const {
      storageType = 'ram',
      swarm = DEFAULT_SWARM_CONFIG,
      storagePath = 'dxos/storage',
      wns,
      snapshots = false,
      snapshotInterval
    } = config;

    this._feedStore = new FeedStore(createStorage(`${storagePath}/feeds`, storageType === 'persistent' ? undefined : storageType),
      { feedOptions: { valueEncoding: codec } });
    this._keyring = new Keyring(new KeyStore(storageType === 'ram' ? memdown() : leveljs(`${storagePath}/keystore`)));
    this._swarmConfig = swarm;

    this._identityManager = new IdentityManager(this._keyring);
    this._modelFactory = new ModelFactory()
      .registerModel(ObjectModel);

    this._networkManager = new NetworkManager(this._feedStore, new SwarmProvider(this._swarmConfig));

    const feedStoreAdapter = new FeedStoreAdapter(this._feedStore);

    this._snapshotStore = new SnapshotStore(snapshots
      ? createStorage(`${storagePath}/snapshots`, storageType === 'persistent' ? undefined : storageType)
      : createStorage('fake', 'ram')
    );

    this._partyFactory = new PartyFactory(
      this._identityManager,
      feedStoreAdapter,
      this._modelFactory,
      this._networkManager,
      this._snapshotStore,
      { snapshots, snapshotInterval }
    );
    this._partyManager = new PartyManager(this._identityManager, feedStoreAdapter, this._partyFactory, this._snapshotStore);

    this._echo = new ECHO(this._partyManager);
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

    const timeoutId = setTimeout(() => {
      console.error('Client.initialize is taking more then 10 seconds to complete. Something probably went wrong.');
    }, 10000);

    await this._keyring.load();

    // If this has to be done, it should be done thru database.
    // Actually, the we should move all initialze into database.
    await this._partyManager.open();

    if (!this._identityManager.halo && this._identityManager.identityKey) {
      await this._partyManager.createHalo();
    }
    this._initialized = true;
    clearInterval(timeoutId);
  }

  /**
   * Cleanup, release resources.
   */
  async destroy () {
    await this._echo.close();
    await this._networkManager.close();
  }

  /**
   * Resets and destroys client storage.
   * Warning: Inconsistent state after reset, do not continue to use this client instance.
   */
  async reset () {
    if (this._feedStore.storage.destroy) {
      await this._feedStore.storage.destroy();
    }

    await this._keyring.deleteAllKeyRecords();
  }

  /**
   * Create Profile. Add Identity key if public and secret key are provided. Then initializes profile with given username.
   * If not public and secret key are provided it relies on keyring to contain an identity key.
   */
  async createProfile ({ publicKey, secretKey, username }: CreateProfileOptions = {}) {
    if (publicKey && secretKey) {
      await this._keyring.addKeyRecord({ publicKey, secretKey, type: KeyType.IDENTITY });
    }

    if (!this._identityManager.identityKey) {
      throw new Error('Cannot create profile. Either no keyPair (public and secret key) was provided or cannot read Identity from keyring.');
    }
    await this._partyManager.createHalo({
      identityDisplayName: username || keyToString(this._identityManager.identityKey.publicKey)
    });
  }

  /**
   * @returns {ProfileInfo} User profile info.
   */
  getProfile () {
    if (!this._identityManager.identityKey) return;

    const publicKey = keyToString(this._identityManager.identityKey.publicKey);

    return {
      username: this._identityManager.displayName,
      publicKey
    };
  }

  /**
   * @returns true if the profile exists.
   */
  hasProfile () {
    return !!this.getProfile();
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
   * @deprecated
   * @param {Buffer} publicKey Party publicKey
   * @param {Buffer} recipient Recipient publicKey
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createOfflineInvitation (partyKey: Uint8Array, recipientKey: Buffer) {
    console.warn('createOfflineInvitation deprecated. check Database');
  }

  /**
   * @deprecated
   * Join a Party by redeeming an Invitation.
   * @param {InvitationDescriptor} invitation
   * @param {SecretProvider} secretProvider
   * @returns {Promise<Party>} The now open Party.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async joinParty (invitation: InvitationDescriptor, secretProvider: SecretProvider) {
    console.warn('deprecated. Use client.echo');
  }

  /**
   * Redeems an invitation for this Device to be admitted to an Identity.
   * @param {InvitationDescriptor} invitation
   * @param {SecretProvider} secretProvider
   * @returns {Promise<DeviceInfo>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async admitDevice (invitation: InvitationDescriptor, secretProvider: SecretProvider) {
    console.log('client.admitDevice: Device management is not implemented.');
  }

  /**
   * @deprecated
   */
  getParties () {
    console.warn('deprecated. Use client.echo');
  }

  /**
   * @deprecated
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getParty (partyKey: Uint8Array) {
    console.warn('deprecated. Use client.echo');
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
   * @deprecated
   */
  async createSubscription () {
    console.warn('deprecated');
  }

  /**
   * Registers a new model.
   */
  registerModel (constructor: ModelConstructor<any>): this {
    this._modelFactory.registerModel(constructor);

    return this;
  }

  get keyring () {
    return this._keyring;
  }

  get echo () {
    return this._echo;
  }

  // keep this for devtools ???
  get feedStore () {
    return this._feedStore;
  }

  // TODO(burdon): Remove.
  /**
   * @deprecated
   */
  get modelFactory () {
    console.warn('client.modelFactory is deprecated.');
    return this._modelFactory;
  }

  // TODO(burdon): Remove.
  /**
   * @deprecated
   */
  get networkManager () {
    return this._networkManager;
  }

  // TODO(burdon): Remove.
  /**
   * @deprecated
   */
  get partyManager () {
    console.warn('deprecated. Use client.database');
    return this._partyManager;
  }

  get registry () {
    return this._registry;
  }
}

const DEFAULT_SWARM_CONFIG: ClientConfig['swarm'] = {
  signal: 'ws://localhost:4000',
  ice: [{ urls: 'stun:stun.wireline.ninja:3478' }]
};

/**
 * Client factory.
 * @deprecated
 */
export const createClient = async () => {
  throw new Error('createClient is being deprecated. Please use new Client() instead.');
};
