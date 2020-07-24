//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';

import { Client } from '@dxos/client';
import { ClientProvider } from '@dxos/react-client';
import { createStorage } from '@dxos/random-access-multi-storage';
import { Keyring, KeyType } from '@dxos/credentials';

const storage = createStorage('./db/stories', 'ram');
const config = {
  debug: {
    mode: 'development'
  }
};

export function WithClientWithNoWallet (story) {
  const client = new Client({ storage });
  return (
    <ClientProvider client={client} config={config}>
      {story()}
    </ClientProvider>
  );
}

export function WithClientWithWallet (story) {
  const [client, setClient] = useState(false);

  useEffect(() => {
    async function runEffect () {
      const keyring = new Keyring();
      await keyring.createKeyRecord({ type: KeyType.IDENTITY });
      const client = new Client({ storage, keyring });
      await client.initialize();
      await client.partyManager.identityManager.initializeForNewIdentity();
      return client;
    }
    runEffect().then(setClient);
  }, []);
  return (
    <>
      {client && (
        <ClientProvider client={client} config={config}>
          {story()}
        </ClientProvider>
      )}
    </>
  );
}
