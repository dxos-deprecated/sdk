//
// Copyright 2020 DXOS.org
//

import { useEffect, useState } from 'react';

import { trigger } from '@dxos/async';
import { createAuthMessage, codec } from '@dxos/credentials';
import { keyToString } from '@dxos/crypto';
import { InviteType } from '@dxos/party-manager';

import { useClient } from './client';

/**
 * Handles the invitation handshake.
 * @param {InvitationDescriptor} invitation
 * @returns {[Object, function]}
 */
export const useAuthenticator = (invitation) => {
  const client = useClient();
  const [state, setState] = useState({});
  const [secretProvider, secretResolver] = trigger();

  useEffect(() => {
    // An invitation where we can use our Identity key for auth.
    if (InviteType.OFFLINE_KEY === invitation.type) {
      // Connect to inviting peer.
      client.partyManager.joinParty(invitation, () =>
        codec.encode(createAuthMessage(client.keyring,
          invitation.swarmKey,
          client.partyManager.identityManager.keyRecord,
          client.partyManager.identityManager.deviceManager.keyChain))
      )
        .then(party => {
          setState({ topic: keyToString(party.publicKey) });
        })

        // TODO(burdon): Doesn't support retry. Provide hint (e.g., should retry/cancel).
        .catch(err => {
          setState({ error: String(err) });
        });
    } else if (invitation.identityKey) {
      // An invitation for this device to join an existing Identity.
      // Join the Identity
      client.partyManager.identityManager.deviceManager.admitDevice(invitation, secretProvider)
        .then(() => {
          setState({ identity: keyToString(invitation.identityKey) });
        })

        // TODO(burdon): Doesn't support retry. Provide hint (e.g., should retry/cancel).
        .catch(err => {
          setState({ error: String(err) });
        });
    // An invitation for this Identity to join a Party.
    } else {
      // Connect to inviting peer.
      client.partyManager.joinParty(invitation, secretProvider)
        .then(party => {
          setState({ topic: keyToString(party.publicKey) });
        })

        // TODO(burdon): Doesn't support retry. Provide hint (e.g., should retry/cancel).
        .catch(err => {
          setState({ error: String(err) });
        });
    }
  }, []);

  return [state, secretResolver];
};
