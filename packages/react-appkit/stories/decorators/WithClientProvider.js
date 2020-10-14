//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';

import { Client } from '@dxos/client';
import { ClientProvider } from '@dxos/react-client';
import { createStorage } from '@dxos/random-access-multi-storage';
import { Keyring, KeyType } from '@dxos/credentials';
import { createSchema, Registry, DEFAULT_CHAIN_ID } from '@wirelineio/registry-client';
import { config, registryData } from '../common';

const storage = createStorage('./db/stories', 'ram');

export const WithClient = (story) => {
  const client = new Client({ storage });
  return (
    <RenderProvider story={story} client={client} config={config} />
  );
};

export const WithClientAndIdentity = (story) => {
  const [client, setClient] = useState(false);

  useEffect(() => {
    async function runEffect () {
      const keyring = new Keyring();
      await keyring.createKeyRecord({ type: KeyType.IDENTITY });
      const schema = await createSchema(registryData);
      const registry = new Registry(undefined, DEFAULT_CHAIN_ID, { schema });
      // TODO(rzadp,rburdon): Replace with actual client SDK for creating a profile
      const client = new Client({ storage, keyring, registry });
      await client.initialize();
      setClient(client);
    }
    runEffect();
  }, []);
  return (
    <>
      {client && (
        <RenderProvider story={story} client={client} config={config} />
      )}
    </>
  );
};

function RenderProvider ({ story, ...props }) {
  return (
    <ClientProvider {...props}>
      <div className='WithClientDecorator'>{story()}</div>
    </ClientProvider>
  );
}
