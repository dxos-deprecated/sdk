//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';
import getDisplayName from 'react-display-name';

import { useClient } from './client';

/**
 * Get party.
 */
export const useParty = partyKey => {
  const { client } = useClient();
  const [party, setParty] = useState();

  useEffect(() => {
    if (!client) return;
    setImmediate(async () => {
      const party = await client.echo.getParty(partyKey);
      setParty(party);
    });
  }, [client]);

  return party;
};

/**
 * Get parties.
 */
export const useParties = () => {
  const { client } = useClient();
  const [parties, setParties] = useState([]);

  useEffect(asyncEffect(async () => {
    if (!client) return;
    const result = await client.echo.queryParties();
    setParties(result.value);

    return result.subscribe(() => {
      setParties(result.value);
    });
  }), [client]);

  return parties;
};

/**
 * Helper to use async functions inside effects ?
 */
function asyncEffect (fun) {
  return () => {
    const promise = fun();
    return () => promise.then(cb => cb());
  };
}

export const withParties = WrappedComponent => {
  const Component = ({ ...rest }) => {
    const parties = useParties();

    return <WrappedComponent {...rest} parties={parties} />;
  };

  Component.displayName = `withParties(${getDisplayName(WrappedComponent)})`;
  return Component;
};
