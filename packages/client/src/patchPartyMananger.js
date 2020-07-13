//
// Copyright 2020 DXOS.org
//

import { waitForCondition } from '@dxos/party-manager';
import { waitForEvent } from '@dxos/async';
import { keyToString, keyToBuffer } from '@dxos/crypto';
import { logs } from '@dxos/debug';

const { error: membershipError } = logs('dxos:client:membership');
const MAX_WAIT = 1000;

export const patchPartyManager = (PartyManager) => {
  PartyManager.prototype._waitForPartiesToBeOpen = async function () {
    const partyWaiters = [];
    for (const { publicKey } of this.getPartyInfoList()) {
      if (!this.hasParty(publicKey)) {
        partyWaiters.push(waitForEvent(this, 'party',
          partyKey => partyKey.equals(publicKey)));
      }
    }
    await Promise.all(partyWaiters);
  };

  PartyManager.prototype._appendMessage = async function (message, topic) {
    if (!this._partyWriters) {
      this._partyWriters = {};
    }
    let append = this._partyWriters[topic];
    if (!append) {
      const feed = await this.getWritableFeed(keyToBuffer(topic));
      append = (message) => new Promise((resolve, reject) => {
        feed.append(message, (err, seq) => {
          if (err) return reject(err);
          resolve(seq);
        });
      });
      this._partyWriters[topic] = append;
    }

    return append(message);
  };

  PartyManager.prototype._getOwnershipInformation = async function (message, topic) {
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
        const partyInfo = this.getPartyInfo(partyKey);
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
  };
};
