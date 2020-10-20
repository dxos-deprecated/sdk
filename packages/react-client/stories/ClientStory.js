//
// Copyright 2020 DXOS.org
//

import { Client } from '@dxos/client';
import React, { useState, useEffect } from 'react';

import { ClientProvider, useClient } from '../src';

const clientConfig = {
  storage: {
    ram: true
  }
};

const Test = () => {
  const client = useClient();
  return (
    <div>
      <h1>Client</h1>
      <pre>{JSON.stringify(client.config)}</pre>
    </div>
  );
};

const ClientStory = () => {
  const [client, setClient] = useState();

  useEffect(() => {
    setImmediate(async () => {
      const client = new Client(clientConfig);
      await client.initialize();
      setClient(client);
    })
  })

  return client 
    ? (
      <ClientProvider config={clientConfig}>
        <Test />
      </ClientProvider>
    ) : (
      <div>Loading...</div>
    );
};

export default ClientStory;
