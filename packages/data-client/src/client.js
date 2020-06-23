//
// Copyright 2019 Wireline, Inc.
//

import assert from 'assert';
import debug from 'debug';
import defaultsDeep from 'lodash.defaultsdeep';
import bufferJson from 'buffer-json-encoding';

import { waitForEvent } from '@dxos/async';
import { keyToString, keyToBuffer } from '@dxos/crypto';
import { FeedStore } from '@dxos/feed-store';
import metrics from '@dxos/metrics';
import { NetworkManager, SwarmProvider } from '@dxos/network-manager';
import { PartyManager, waitForCondition } from '@dxos/party-manager';
import { ModelFactory } from '@dxos/model-factory';
import { logs } from '@dxos/debug';

import { defaultClientConfig } from './config';

const log = debug('dxos:client');

const { error: membershipError } = logs('dxos:client:membership');

const MAX_WAIT = 1000;

/**
 * Data client.
 */
class Client {

  /**
   * @param {FeedStore} feedStore
   * @param {NetworkManager} networkManager
   * @param {PartyManager} partyManager
   * @param {Keyring} keyring
   * @param {Object} config
   */
  // TODO(burdon): Create builder pattern (for factory) rather than complex constructors.
  constructor(feedStore, networkManager, partyManager, keyring, config) {
    assert(feedStore);
    assert(config);

    this._feedStore = feedStore;
    this._partyManager = partyManager;
    this._networkManager = networkManager;
    this._keyring = keyring;
    this._config = config;

    this._partyWritters = {};
    this._modelFactory = new ModelFactory(feedStore, {
      onAppend: async (message, { topic }) => {
        return this._appendMessage(message, topic);
      },
      // TODO(telackey): This is obviously not an efficient lookup mechanism, but it works as an example of
      onMessage: async (message, { topic }) => this._getOwnershipInformation(message, topic)
    });

    // TODO(burdon): consider using async’s addListener
    feedStore.on('feed', this.onFeedUpdate);
    this.onFeedUpdate(feedStore);
  }

  async destroy() {
    await this._partyManager.destroy();
    await this._networkManager.close();
    this._feedStore.removeListener('feed', this.onFeedUpdate);
  }

  onFeedUpdate = () => {
    const descriptors = this._feedStore.getDescriptors();

    log('Feeds', JSON.stringify(
      descriptors.map(({ path, key, metadata: { topic } }) => ({
        path,
        topic,
        key: keyToString(key)
      })), undefined, 2
    ));

    metrics.set('feed-store.descriptors', descriptors.length);
  };

  get config() {
    return this._config;
  }

  get keyring() {
    return this._keyring;
  }

  get feedStore() {
    return this._feedStore;
  }

  get modelFactory() {
    return this._modelFactory;
  }

  // TODO(dboreham): What about get swarmFactory?
  get networkManager() {
    return this._networkManager;
  }

  // TODO(burdon): Remove.
  get partyManager() {
    return this._partyManager;
  }

  // TODO(burdon): Consistent pattern for delete (e.g., db and objects). Shut down all objects.
  async reset() {
    await this._feedStore.close();
    if (this._feedStore.storage.destroy) {
      await this._feedStore.storage.destroy();
    }

    // Warning: This Client object is in an inconsistent state after clearing the KeyRing, do not continue to use.
    await this._keyring.deleteAllKeyRecords();
  }

  // TODO(telackey): Does this belong here, in PartyManager, or up to the user?
  async _waitForPartiesToBeOpen() {
    const partyWaiters = [];
    for (const { publicKey } of this._partyManager.getPartyInfoList()) {
      if (!this._partyManager.hasParty(publicKey)) {
        partyWaiters.push(waitForEvent(this._partyManager, 'party',
          partyKey => partyKey.equals(publicKey)));
      }
    }
    await Promise.all(partyWaiters);
  }

  async _appendMessage(message, topic) {
    let append = this._partyWritters[topic];
    if (append) {
      return append(message);
    }

    const feed = await this._partyManager.getWritableFeed(keyToBuffer(topic));
    append = (message) => new Promise((resolve, reject) => {
      feed.append(message, (err, seq) => {
        if (err) return reject(err);
        resolve(seq);
      });
    });
    this._partyWritters[topic] = append;
    return append(message);
  }

  async _getOwnershipInformation(message, topic) {
    if (!topic) return message;

    // obtaining the ownership information. We can add a map/index for faster lookups as needed.
    // If the feed is being replicated, we must have established the ownership info for it, but there is race
    // between that and all the event propagation for updating the PartyInfo, PartyMemberInfo, etc. That only
    // needs done once per-feed, but it must be done before we can gather the owner info here. We set a max wait
    // because not responding in a timely fashion would be evidence of an error.

    const { key: feedKey } = message;
    const partyKey = keyToBuffer(topic);

    try {
      const owner = await waitForCondition(() => {
        const partyInfo = this._partyManager.getPartyInfo(partyKey);
        if (partyInfo) {
          for (const member of partyInfo.members) {
            for (const memberFeed of member.feeds) {
              if (memberFeed.equals(feedKey)) {
                return member.publicKey;
              }
            }
          }
        }
        return undefined;
      }, MAX_WAIT);

      if (!owner) {
        membershipError(`No owner of feed ${keyToString(message.key)} on ${topic}, rejecting message:`,
          JSON.stringify(message.data));
        return undefined;
      }

      // TODO(telackey): This should not modify the data, instead we should deliver a (data, metadata) tuple.
      // However, that means adjusting all the current uses of Model, so will take appropriate planning.
      message.data.__meta = {
        credentials: {
          party: partyKey,
          feed: message.key,
          member: owner
        }
      };

      return message;
    } catch (err) {
      return undefined;
    }
  }
}

/**
 * Client factory.
 * @param {RandomAccessAbstract} feedStorage
 * @param {Keyring} keyring
 * @param {Object} config
 * @param {Array} plugins
 * @return {Promise<Client>}
 */
// TODO(dboreham) Plugins param not honored (and wasn't before):
export const createClient = async (feedStorage, keyring, config = {}, plugins) => {
  config = defaultsDeep({}, config, defaultClientConfig);

  log('Creating client...', JSON.stringify(config, undefined, 2));

  const feedStore = await FeedStore.create(feedStorage, {
    feedOptions: {
      // TODO(burdon): Use codec.
      // TODO(dboreham): This buffer-json codec is required for party-manager to function.
      valueEncoding: 'buffer-json'
    },
    codecs: {
      'buffer-json': bufferJson
    }
  });

  // TODO(dboreham): NetworkManager and SwarmProvider should be not owned by Client.
  const swarmProvider = new SwarmProvider(config.swarm, metrics);
  // TODO(dboreham): plugins parameter not yet implemented in NetworkManager.
  const networkManager = new NetworkManager(feedStore, swarmProvider, plugins);
  const partyManager = new PartyManager(feedStore, keyring, networkManager);
  await partyManager.initialize();

  const client = new Client(feedStore, networkManager, partyManager, keyring, config);
  await client._waitForPartiesToBeOpen();

  return client;
};
