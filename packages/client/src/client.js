//
// Copyright 2020 DXOS.org
//

import defaultsDeep from 'lodash.defaultsdeep';

import memdown from 'memdown';

import { createStorage } from '@dxos/random-access-multi-storage';
import { Keyring, KeyStore, KeyType } from '@dxos/credentials';
import { keyToString } from '@dxos/crypto';
import { FeedStore } from '@dxos/feed-store';
import metrics from '@dxos/metrics';
import { ModelFactory } from '@dxos/model-factory';
import { NetworkManager, SwarmProvider } from '@dxos/network-manager';
import {
  codec, ECHO, PartyManager, PartyFactory, FeedStoreAdapter, IdentityManager
} from '@dxos/echo-db';
import { ObjectModel } from '@dxos/object-model';

import { defaultClientConfig } from './config';

/**
 * Data client.
 */
export class Client {
  /**
   * @param {Object} config
   * @param {RandomAccessAbstract} config.storage a random access storage instance.
   * @param {Object} config.swarm
   * @param {Keyring} config.keyring
   * @param {FeedStore} config.feedStore Optional. If provided, config.storage is ignored.
   * @param {NetworkManager} config.networkManager Optional. If provided, config.swarm is ignored.
   * @param {PartyManager} config.partyManager Optional.
   * @param {Registry} config.registry Optional.
   */
  constructor ({ storage, swarm, keyring, feedStore, networkManager, partyManager, registry }) {
    this._feedStore = feedStore || new FeedStore(
      storage || createStorage('dxos-storage-db', 'ram'),
      { feedOptions: { valueEncoding: codec } });
    this._keyring = keyring || new Keyring(new KeyStore(memdown()));
    this._swarmConfig = swarm;

    this._identityManager = new IdentityManager(this._keyring);
    this._modelFactory = new ModelFactory()
      .registerModel(ObjectModel);

    this._networkManager = networkManager || new NetworkManager(this._feedStore, new SwarmProvider(this._swarmConfig, metrics));

    const feedStoreAdapter = new FeedStoreAdapter(this._feedStore);

    this._partyFactory = new PartyFactory(this._identityManager, feedStoreAdapter, this._modelFactory, this._networkManager);
    this._partyManager = partyManager || new PartyManager(this._identityManager, feedStoreAdapter, this._partyFactory);

    this._echo = new ECHO(this._partyManager);
    this._registry = registry;

    this._partyWriters = {};
    this._feedOwnershipCache = new Map();
  }

  /**
   * Initializes internal resources.
   */
  async initialize () {
    if (this._initialized) {
      return;
    }

    await this._keyring.load();

    // If this has to be done, it should be done thru database.
    // Actually, the we should move all initialze into database.
    await this._partyManager.open();

    if (!this._identityManager.halo && this._identityManager.identityKey) {
      await this._partyManager.createHalo();
    }
    this._initialized = true;
  }

  /**
   * Cleanup, release resources.
   */
  async destroy () {
    await this._partyManager.destroy();
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
   *
   * @param {Object} options
   * @param {Buffer} options.publicKey
   * @param {Buffer} options.secretKey
   * @param {String} options.username
   */
  async createProfile ({ publicKey, secretKey, username } = {}) {
    if (publicKey && secretKey) {
      await this._keyring.addKeyRecord({ publicKey, secretKey, type: KeyType.IDENTITY });
    }

    if (!this._identityManager.identityKey) {
      throw new Error('Cannot create profile. Either no keyPair (public and secret key) was provided or cannot read Identity from keyring.');
    }
    await this._partyManager.createHalo({
      identityDisplayName: username || keyToString(this._identityManager.identityKey.publicKey)
    });

    // await this._identityManager.initializeForNewIdentity({
    //   identityDisplayName: username || keyToString(this._identityManager.identityKey.publicKey)
    //   // deviceDisplayName: keyToString(this._identityManager.deviceManager.identityKey)
    // });
  }

  /**
   * @returns {ProfileInfo} User profile info.
   */
  getProfile () {
    if (!this._identityManager.identityKey) return;

    const publicKey = keyToString(this._identityManager.identityKey.publicKey);

    return {
      username: publicKey,
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
   * @param {Buffer} partyKey Party publicKey
   * @param {SecretProvider} secretProvider
   */
  async createInvitation (partyKey, secretProvider, options) {
    const party = await this.echo.getParty(partyKey);
    return party.createInvitation({
      secretValidator: (invitation, secret) => secret && secret.equals(invitation.secret),
      secretProvider
    },
    options);
  }

  /**
   * @deprecated
   * @param {Buffer} publicKey Party publicKey
   * @param {Buffer} recipient Recipient publicKey
   */
  async createOfflineInvitation (partyKey, recipientKey) {
    console.warn('createOfflineInvitation deprecated. check Database');

    // return this.database._partyManager.inviteToParty(
    //   partyKey,
    //   new InviteDetails(InviteType.OFFLINE_KEY, { publicKey: recipientKey })
    // );
  }

  /**
   * @deprecated
   * Join a Party by redeeming an Invitation.
   * @param {InvitationDescriptor} invitation
   * @param {SecretProvider} secretProvider
   * @returns {Promise<Party>} The now open Party.
   */
  async joinParty (invitation, secretProvider) {
    console.warn('deprecated. Use client.echo');
    // // An invitation where we can use our Identity key for auth.
    // if (InviteType.OFFLINE_KEY === invitation.type) {
    //   // Connect to inviting peer.
    //   return this._partyManager.joinParty(invitation, (info) =>
    //     codec.encode(createAuthMessage(this._keyring, info.id.value,
    //       this._partyManager.identityManager.keyRecord,
    //       this._partyManager.identityManager.deviceManager.keyChain,
    //       null, info.authNonce.value))
    //   );
    // } else if (!invitation.identityKey) {
    //   // An invitation for this Identity to join a Party.
    //   // Connect to inviting peer.
    //   return this._partyManager.joinParty(invitation, secretProvider);
    // }
  }

  /**
   * Redeems an invitation for this Device to be admitted to an Identity.
   * @param {InvitationDescriptor} invitation
   * @param {SecretProvider} secretProvider
   * @returns {Promise<DeviceInfo>}
   */
  async admitDevice (invitation, secretProvider) {
    if (invitation.identityKey) {
      // An invitation for this device to join an existing Identity.
      // Join the Identity
      return this._partyManager.identityManager.deviceManager.admitDevice(invitation, secretProvider);
    }
  }

  /**
   * @deprecated
   */
  getParties () {
    console.warn('deprecated. Use client.echo');
    // return this._partyManager.getPartyInfoList();
  }

  /**
   * @deprecated
   */
  getParty (partyKey) {
    console.warn('deprecated. Use client.echo');
    // return this._partyManager.getPartyInfo(partyKey);
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
   * @param {Object} config
   * @param {} config.modelType
   * @param {} config.options
   * @return {model}
   */
  async createSubscription ({ modelType, options } = {}) {
    console.warn('deprecated');
    // return this._modelFactory.createModel(modelType, options);
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
  get modelFactory () {
    console.warn('client.modelFactory is deprecated.');
    return this._modelFactory;
  }

  // TODO(burdon): Remove.
  get networkManager () {
    return this._networkManager;
  }

  // TODO(burdon): Remove.
  get partyManager () {
    console.warn('deprecated. Use client.database');
    return this._partyManager;
  }
}

/**
 * Client factory.
 * @deprecated
 * @param {RandomAccessAbstract} feedStorage
 * @param {Keyring} keyring
 * @param {Object} config
 * @return {Promise<Client>}
 */
export const createClient = async (feedStorage, keyring, config = {}) => {
  config = defaultsDeep({}, config, defaultClientConfig);

  console.warn('createClient is being deprecated. Please use new Client() instead.');

  const client = new Client({
    storage: feedStorage,
    swarm: config.swarm,
    keyring // remove this later but it is required by cli, bots, and tests.
  });

  await client.initialize();

  return client;
};
