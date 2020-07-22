//
// Copyright 2020 DXOS.org
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
    client.joinParty(invitation, secretProvider)
      .then(party => {
        setState({ topic: keyToString(party.publicKey) });
      })

      // TODO(burdon): Doesn't support retry. Provide hint (e.g., should retry/cancel).
      .catch(err => {
        setState({ error: String(err) });
      });

    if (invitation.identityKey) {
      // An invitation for this device to join an existing Identity.
      // Join the Identity
      client.admitDevice(invitation, secretProvider)
        .then(() => {
          setState({ identity: keyToString(invitation.identityKey) });
        })

        // TODO(burdon): Doesn't support retry. Provide hint (e.g., should retry/cancel).
        .catch(err => {
          setState({ error: String(err) });
        });
    }
  }, []);

  return [state, secretResolver];
};
