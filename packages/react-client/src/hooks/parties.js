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
  const client = useClient();
  return partyKey ? client.echo.getParty(partyKey) : undefined;
};

/**
 * Get parties.
 */
export const useParties = () => {
  const client = useClient();
  const [parties, setParties] = useState([]);

  useEffect(() => {
    const result = client.echo.queryParties();
    setParties(result.value);

    const unsubscribe = result.subscribe(() => {
      setParties(result.value);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return parties;
};

export const withParties = WrappedComponent => {
  const Component = ({ ...rest }) => {
    const parties = useParties();

    return <WrappedComponent {...rest} parties={parties} />;
  };

  Component.displayName = `withParties(${getDisplayName(WrappedComponent)})`;
  return Component;
};
