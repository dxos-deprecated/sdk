//
// Copyright 2020 DXOS.org
//

import { promiseTimeout, waitForCondition, waitForEvent } from '@dxos/async';
import { keyToBuffer, keyToString } from '@dxos/crypto';
import { logs } from '@dxos/debug';

const { error } = logs('dxos:client:membership');

const MAX_WAIT = 5000;

// TODO(burdon): Refactor into PartyManager (with tests).
export class PartyManagerWrapper {
  // TODO(burdon): Document.
  _partyWriters = {};
  _feedOwnershipCache = new Map();

  set (partyManager) {
    this._partyManager = partyManager;
    return this;
  }

  get partyManager () {
    return this._partyManager;
  }

  // TODO(burdon): Create test for this.
  get modelFactoryOptions () {
    return {
      onAppend: async (message, { topic }) => this._appendMessage(message, topic),
      onMessage: async (message, { topic }) => this._getOwnershipInformation(message, topic)
    };
  }

  // Delegated methods.

  async initialize () {
    await this._partyManager.initialize();
    await this._waitForPartiesToBeOpen();
  }

  async destroy () {
    await this._partyManager.destroy();
  }

  // TODO(burdon): Merge with PartyManager.

  async _appendMessage (message, topic) {
    let append = this._partyWriters[topic];
    if (!append) {
      const feed = await this._partyManager().getWritableFeed(keyToBuffer(topic));
      append = (message) => new Promise((resolve, reject) => {
        feed.append(message, (err, seq) => {
          if (err) {
            return reject(err);
          }

          resolve(seq);
        });
      });

      this._partyWriters[topic] = append;
    }

    return append(message);
  }

  async _waitForPartiesToBeOpen () {
    const partyWaiters = [];
    for (const { publicKey } of this._partyManager().getPartyInfoList()) {
      if (!this._partyManager().hasParty(publicKey)) {
        // TODO(burdon): Dangerous.
        partyWaiters.push(
          waitForEvent(this._partyManager(), 'party', partyKey => partyKey.equals(publicKey)));
      }
    }

    await Promise.all(partyWaiters);
  }

  async _getOwnershipInformation (message, topic) {
    if (!topic) return message;

    // If the feed is being replicated, we must have established the ownership info for it, but there is race
    // between that and all the event propagation for updating the PartyInfo, PartyMemberInfo, etc. That only
    // needs done once per-feed, but it must be done before we can gather the owner info here. We set a max wait
    // because not responding in a timely fashion would be evidence of an error.

    let owner;
    const { key: feedKey } = message;
    const partyKey = keyToBuffer(topic);

    // Check if there is a already a Promise for this information.
    let ownerPromise = this._feedOwnershipCache.get(keyToString(feedKey));

    // If not, create one which will resolve when the ownership information of this feed is known.
    if (!ownerPromise) {
      // If the feed is being replicated, we must have established the ownership info for it, but there is race
      // between that and all the event propagation for updating the PartyInfo, PartyMemberInfo, etc. That only
      // needs done once per-feed, but it must be done before we can gather the owner info here.
      ownerPromise = waitForCondition(() => {
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
      });

      this._feedOwnershipCache.set(keyToString(feedKey), ownerPromise);
    }

    try {
      // We set a max wait because, while we may have to wait for a moment for event propagation to update,
      // all the state, not responding in a timely fashion would indicate a problem.
      owner = await promiseTimeout(ownerPromise, MAX_WAIT);
    } catch (err) {
      error(`Timed out waiting for owner of feed ${keyToString(feedKey)}`, err);
      owner = undefined;
    }

    if (!owner) {
      // TODO(burdon): Throw exception.
      // Lack of ownership info is a fatal error for this message.
      error(`No owner of feed ${keyToString(feedKey)} on ${topic}, rejecting message:`, JSON.stringify(message.data));
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
  }
}
