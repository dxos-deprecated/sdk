//
// Copyright 2020 DXOS.
//

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { keyToBuffer, keyToString } from '@dxos/crypto';
import { useClient } from '@dxos/react-client';
import { Button } from '@material-ui/core';

import KeyTable from '../components/KeyTable';
import AppContainer from './AppContainer';
import DefaultSidebar from './DefaultSidebar';

/**
 * Displays keys for the current identity.
 */
const KeyRing = () => {
  const client = useClient();
  const { topic } = useParams();
  const { keyring } = client;
  const [keys, setKeys] = useState([]);
  const [viewPartyKeys, setViewPartyKeys] = useState(true);

  useEffect(() => {
    if (topic && viewPartyKeys) {
      // TODO(dboreham): Determine if the previous async update issues are gone with party-manager.
      const party = client.partyManager.getParty(keyToBuffer(topic));
      const partyKeys = new Map();

      partyKeys.set(keyToString(party.publicKey), keyring.getKey(party.publicKey));
      party.memberKeys.forEach(key => partyKeys.set(keyToString(key), keyring.getKey(key)));
      party.memberFeeds.forEach(key => partyKeys.set(keyToString(key), keyring.getKey(key)));

      setKeys(Array.from(partyKeys.values()));
    } else {
      setKeys(keyring.keys);
    }
  }, [topic, viewPartyKeys]);

  return (
    <AppContainer sidebarContent={<DefaultSidebar />}>
      <KeyTable keys={keys} />
      {topic && (
        <Button
          size='large'
          color='primary'
          onClick={() => setViewPartyKeys(value => !value)}
        >
          {viewPartyKeys ? 'View all keys' : 'View party keys'}
        </Button>
      )}
    </AppContainer>
  );
};

export default KeyRing;
