//
// Copyright 2020 DXOS.org
//

import { Client } from '@dxos/client';
import React, { useState, useEffect } from 'react';

import { ClientProvider, useClient } from '../src';


const Test = () => {
  const client = useClient();
  return (
    <div>
      <h1>Client</h1>
      <pre>{JSON.stringify(client.config)}</pre>
    </div>
  );
};

export default {
    title: 'ClientStory',
}

export const ClientStory = () => {
  const [client, setClient] = useState<Client | undefined>();

  useEffect(() => {
    setImmediate(async () => {
      const client = new Client();
      await client.initialize();
      setClient(client);
    })
  })

  return client 
    ? (
      <ClientProvider client={client}>
        <Test />
      </ClientProvider>
    ) : (
      <div>Loading...</div>
    );
};
