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
import { patchPartyManager } from './patchPartyMananger';

// TODO(elmasse): Remove once PartyManager has been updated.
patchPartyManager(PartyManager);

const MAX_WAIT = 5000;
const log = debug('dxos:client');

/**
 * Data client.
 */
export class Client {
  /**
   * @param {Object} config
   *  @param {RandomAccessAbstract} config.storage
   *  @param {Object} config.swarm
   *  @param {Keyring} config.keyring
   *  @param {FeedStore} config.feedStore. Optional. If provided, config.storage is ignored.
   *  @param {NetworkManager} config.networkManager. Optional. If provided, config.swarm is ignored.
   *  @param {PartyManager} config.partyManager. Optional.
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
    this._networkManager = networkManager || new NetworkManager(this._feedStore, new SwarmProvider(swarm, metrics));
    this._partyManager = partyManager || new PartyManager(this._feedStore, this._keyring, this._networkManager);

    this._modelFactory = new ModelFactory(this._feedStore, {
      onAppend: async (message, { topic }) => {
        return this._partyManager._appendMessage(message, topic);
      },
      // TODO(telackey): This is obviously not an efficient lookup mechanism, but it works as an example of
      onMessage: async (message, { topic }) => this._partyManager._getOwnershipInformation(message, topic)
    });
  }

  async initialize () {
    await this._keyring.load();
    await this._feedStore.open();
    await this._partyManager.initialize();
    await this._partyManager._waitForPartiesToBeOpen();
  }

  async destroy () {
    await this._partyManager.destroy();
    await this._networkManager.close();
  }

  // TODO(burdon): Remove.
  get keyring () {
    return this._keyring;
  }

  // keep this for devtools ???
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
    return this._partyManager;
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

  const client = new Client({
    storage: feedStorage,
    swarm: config.swarm,
    keyring // remove this later but it is required by cli, bots, and tests.
  });

  await client.initialize();

  return client;
};
