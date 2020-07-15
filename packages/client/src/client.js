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
import { PartyManager, waitForCondition } from '@dxos/party-manager';
import { ModelFactory } from '@dxos/model-factory';

import { defaultClientConfig } from './config';

import { waitForEvent } from '@dxos/async';
import { keyToString, keyToBuffer } from '@dxos/crypto';
import { logs } from '@dxos/debug';

const { error: membershipError } = logs('dxos:client:membership');
const MAX_WAIT = 5000;

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
    this._partyManager = partyManager;
    this._partyWriters = {};
  }

  async initialize () {
    await this._feedStore.open();
    await this._keyring.load();

    // PartyManager and ModelFactory expects to have feedstore instance opened.
    // TODO(elmasse): Refactor ModelFactory.

    if (!this._networkManager) {
      this._networkManager = new NetworkManager(this._feedStore, new SwarmProvider(this._swarmConfig, metrics));
    }

    if (!this._partyManager) {
      this._partyManager = new PartyManager(this._feedStore, this._keyring, this._networkManager);
    }

    if (!this._modelFactory) {
      this._modelFactory = new ModelFactory(this._feedStore, {
        onAppend: async (message, { topic }) => {
          return this._appendMessage(message, topic);
        },
        // TODO(telackey): This is obviously not an efficient lookup mechanism, but it works as an example of
        onMessage: async (message, { topic }) => this._getOwnershipInformation(message, topic)
      });
    }

    await this._partyManager.initialize();
    await this._waitForPartiesToBeOpen();
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

  // ----- MOVE THESE TO PARTYMANAGER

  async _appendMessage (message, topic) {
    let append = this._partyWriters[topic];
    if (!append) {
      const feed = await this._partyManager.getWritableFeed(keyToBuffer(topic));
      append = (message) => new Promise((resolve, reject) => {
        feed.append(message, (err, seq) => {
          if (err) return reject(err);
          resolve(seq);
        });
      });
      this._partyWriters[topic] = append;
    }

    return append(message);
  }

  async _waitForPartiesToBeOpen () {
    const partyWaiters = [];
    for (const { publicKey } of this._partyManager.getPartyInfoList()) {
      if (!this._partyManager.hasParty(publicKey)) {
        partyWaiters.push(waitForEvent(this._partyManager, 'party',
          partyKey => partyKey.equals(publicKey)));
      }
    }
    await Promise.all(partyWaiters);
  }

  async _getOwnershipInformation (message, topic) {
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

  // ---- END MOVE THESE TO PM
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
