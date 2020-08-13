//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';
import getDisplayName from 'react-display-name';

import { keyToBuffer } from '@dxos/crypto';

import { useClient } from './client';

/**
 * Obtains a PartyInfo object for the giver parteKey
 * @param {String|Buffer} key party publicKey.
 * @returns {PartyInfo|undefined} PartyInfo provides details about the Party itself and about Party membership.
 */
export const useParty = (key) => {
  const client = useClient();
  const partyKey = Buffer.isBuffer(key) ? key : keyToBuffer(key);
  const [partyInfo, setPartyInfo] = useState(partyKey ? client.partyManager.getPartyInfo(partyKey) : undefined);

  useEffect(() => {
    setPartyInfo(partyKey ? client.partyManager.getPartyInfo(partyKey) : undefined);
  }, [key]);

  useEffect(() => {
    const listener = (eventPartyKey) => {
      if (eventPartyKey.equals(partyKey)) {
        setPartyInfo(client.partyManager.getPartyInfo(partyKey));
      }
    };

    client.partyManager.on('update', listener);

    return () => {
      client.partyManager.removeListener('update', listener);
    };
  }, []);

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
