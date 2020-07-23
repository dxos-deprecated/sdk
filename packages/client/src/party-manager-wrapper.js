//
// Copyright 2020 DXOS.org
//

import { waitForCondition, waitForEvent } from '@dxos/async';
import { keyToBuffer } from '@dxos/crypto';

const MAX_WAIT = 5000;

// TODO(burdon): Refactor into PartyManager (with tests).
export class PartyManagerWrapper {
  // TODO(burdon): Document.
  _partyWriters = {};

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
    if (!topic) {
      return message;
    }

    // TODO(burdon): Hack to get ownership information.
    // If the feed is being replicated, we must have established the ownership info for it, but there is race
    // between that and all the event propagation for updating the PartyInfo, PartyMemberInfo, etc. That only
    // needs done once per-feed, but it must be done before we can gather the owner info here. We set a max wait
    // because not responding in a timely fashion would be evidence of an error.

    const { key: feedKey } = message;
    const partyKey = keyToBuffer(topic);

    try {
      const owner = await waitForCondition(() => {
        const partyInfo = this._partyManager().getPartyInfo(partyKey);
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
        throw new Error(`Invalid message: ${JSON.stringify(message)}`);
      }

      // TODO(telackey): Change Model API to receive message with envelope.
      message.data.__meta = {
        credentials: {
          party: partyKey,
          feed: message.key,
          member: owner
        }
      };

      return message;
    } catch (err) {
      // TODO(burdon): Do not ignore.
      return undefined;
    }
  }
}
