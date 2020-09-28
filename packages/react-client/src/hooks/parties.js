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
  const { client: { database } } = useClient();
  const [party, setParty] = useState();

  useEffect(() => {
    setImmediate(async () => {
      const party = await database.getParty(partyKey);
      setParty(party);
    });
  }, [database]);

  return party;
};

/**
 * Get parties.
 */
export const useParties = () => {
  const { client: { database } } = useClient();
  const [parties, setParties] = useState([]);

  useEffect(asyncEffect(async () => {
    const result = await database.queryParties();
    setParties(result.value);

    return result.subscribe(() => {
      setParties(result.value);
    });
  }), [database]);

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
