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
    async function runEffect () {
      if (invitation.identityKey) {
        // An invitation for this device to join an existing Identity.
        // Join the Identity
        await client.admitDevice(invitation, secretProvider);
        setState({ identity: keyToString(invitation.identityKey) });
      } else {
        const party = await client.joinParty(invitation, secretProvider);
        setState({ topic: keyToString(party.publicKey) });
      }
    }

    runEffect().catch(err => {
      // TODO(burdon): Doesn't support retry. Provide hint (e.g., should retry/cancel).
      setState({ error: String(err) });
    });
  }, []);

  return [state, secretResolver];
};
