//
// Copyright 2020 Wireline, Inc.
//

import { useEffect, useState } from 'react';

import { trigger } from '@dxos/async';
import { keyToString } from '@dxos/crypto';

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
    // An invitation for this device to join an existing Identity.
    if (invitation.identityKey) {
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
