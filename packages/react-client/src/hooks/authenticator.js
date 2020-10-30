//
// Copyright 2020 DXOS.org
//

import { useEffect, useState, useMemo } from 'react';

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
  const hash = invitation ? invitation.hash : '';

  // Memoize these functions by inivitation hash.
  const [secretProvider, secretResolver] = useMemo(() => trigger(), [hash]);

  useEffect(() => {
    if (!invitation) {
      return;
    }
    // Use an AbortController to avoid "calling setState on unmounted component" errors.
    const controller = new AbortController();
    const signal = controller.signal;

    async function runEffect () {
      if (invitation.identityKey) {
        // An invitation for this device to join an existing Identity.
        // Join the Identity
        await client.admitDevice(invitation, secretProvider);
        if (!signal.aborted) {
          setState({ identity: keyToString(invitation.identityKey) });
        }
      } else {
        const party = await client.database.joinParty(invitation, secretProvider);
        if (!signal.aborted) {
          setState({ topic: keyToString(party.key) });
        }
      }
    }

    runEffect().catch(err => {
      // TODO(burdon): Doesn't support retry. Provide hint (e.g., should retry/cancel).
      if (!signal.aborted) {
        setState({ error: String(err) });
      }
    });

    return () => {
      controller.abort();
    };
  }, [hash]);

  return [state, secretResolver];
};
