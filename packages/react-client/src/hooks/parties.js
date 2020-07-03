//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';
import getDisplayName from 'react-display-name';
import { useParams } from 'react-router-dom';

import { keyToBuffer } from '@dxos/crypto';

import { useClient } from './client';

/**
 * Obtains a PartyInfo object for the currently active Party (if any).
 * PartyInfo provides details about the Party itself and about Party membership.
 * @returns {PartyInfo|undefined}
 */
export const useParty = () => {
  const client = useClient();
  const { topic } = useParams();

  const partyKey = topic ? keyToBuffer(topic) : undefined;
  const [, forceUpdate] = useState({});
  const [partyInfo, setPartyInfo] = useState(partyKey ? client.partyManager.getPartyInfo(partyKey) : undefined);

  useEffect(() => {
    if (!partyKey) return;
    const listener = (eventPartyKey) => {
      if (eventPartyKey.equals(partyKey)) {
        setPartyInfo(client.partyManager.getPartyInfo(partyKey));
        forceUpdate({});
      }
    };

    client.partyManager.on('update', listener);

    return () => {
      client.partyManager.removeListener('update', listener);
    };
  }, [partyKey]);

  return partyInfo;
};

/**
 * Obtains an array of PartyInfo objects for all known Parties.
 * PartyInfo provides details about the Party itself and about Party membership.
 * @returns {PartyInfo[]}
 */
export const useParties = () => {
  const client = useClient();
  const [parties, setParties] = useState(client.partyManager.getPartyInfoList());

  useEffect(() => {
    const listener = () => {
      setParties(client.partyManager.getPartyInfoList());
    };

    client.partyManager.on('update', listener);

    return () => {
      client.partyManager.off('update', listener);
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
