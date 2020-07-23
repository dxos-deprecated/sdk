//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import defaultsDeep from 'lodash.defaultsdeep';
import bufferJson from 'buffer-json-encoding';

import { Keyring } from '@dxos/credentials';
import { FeedStore } from '@dxos/feed-store';
import metrics from '@dxos/metrics';
import { NetworkManager, SwarmProvider } from '@dxos/network-manager';
import { PartyManager } from '@dxos/party-manager';
import { ModelFactory } from '@dxos/model-factory';

import { defaultClientConfig } from './config';
import { PartyManagerWrapper } from './party-manager-wrapper';

const log = debug('dxos:client');

/**
 * Data client.
 */
export class Client {
  /**
   * @param {Object} config
   * @param {RandomAccessAbstract} config.storage
   * @param {Object} config.swarm
   * @param {Keyring} config.keyring
   * @param {FeedStore} config.feedStore. Optional. If provided, config.storage is ignored.
   * @param {NetworkManager} config.networkManager. Optional. If provided, config.swarm is ignored.
   * @param {PartyManager} config.partyManager. Optional.
   */
  constructor ({ storage, swarm, keyring, feedStore, networkManager, partyManager }) {
    this._keyring = keyring || new Keyring();
    this._feedStore = feedStore || new FeedStore(storage, {
      feedOptions: {
        valueEncoding: 'buffer-json'
      },
      codecs: {
        'buffer-json': bufferJson
      }
    });

    this._swarmConfig = swarm;
    this._networkManager = networkManager;

    // TODO(burdon): Remove once PartyManager is refactored.
    this._partyManagerWrapper = new PartyManagerWrapper().set(partyManager);
  }

  async initialize () {
    await this._feedStore.open();
    await this._keyring.load();

    // TODO(elmasse): Refactor ModelFactory.
    // PartyManager and ModelFactory expect to have feedstore instance already open.

    if (!this._networkManager) {
      this._networkManager = new NetworkManager(this._feedStore, new SwarmProvider(this._swarmConfig, metrics));
    }

    // TODO(burdon): Do not re-create if passed in?
    if (!this._partyManagerWrapper.partyManager) {
      this._partyManagerWrapper.set(new PartyManager(this._feedStore, this._keyring, this._networkManager));
    }

    // TODO(burdon): This is always null.
    if (!this._modelFactory) {
      this._modelFactory = new ModelFactory(this._feedStore, this._partyManagerWrapper.modelFactoryOptions);
    }

    await this._partyManagerWrapper.initialize();
  }

  async destroy () {
    await this._partyManagerWrapper.destroy();
    await this._networkManager.close();
  }

  // TODO(burdon): Remove.
  get keyring () {
    return this._keyring;
  }

  // TODO(elmasse): Keep this for devtools?
  get feedStore () {
    return this._feedStore;
  }

  // TODO(burdon): Remove.
  get modelFactory () {
    return this._modelFactory;
  }

  // TODO(burdon): Remove.
  get networkManager () {
    return this._networkManager;
  }

  // TODO(burdon): Remove.
  get partyManager () {
    return this._partyManagerWrapper.partyManager;
  }

  // TODO(burdon): Consistent pattern for delete (e.g., db and objects). Shut down all objects.
  async reset () {
    await this._feedStore.close();
    if (this._feedStore.storage.destroy) {
      await this._feedStore.storage.destroy();
    }

    // Warning: This Client object is in an inconsistent state after clearing the KeyRing, do not continue to use.
    await this._keyring.deleteAllKeyRecords();
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

  log('Creating client...', JSON.stringify(config, undefined, 2));

  // const feedStore = new FeedStore(feedStorage, {
  //   feedOptions: {
  //     valueEncoding: 'buffer-json'
  //   },
  //   codecs: {
  //     'buffer-json': bufferJson
  //   }
  // });

  const client = new Client({
    storage: feedStorage,
    swarm: config.swarm,
    // feedStore,
    keyring // remove this later but it is required by cli, bots, and tests.
  });

  await client.initialize();

  return client;
};
