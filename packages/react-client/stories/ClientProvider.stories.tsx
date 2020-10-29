//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';

import { Client } from '@dxos/client';

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
  title: 'ClientProvider'
};

export const InMemory = () => {
  const [client, setClient] = useState<Client | undefined>();

  useEffect(() => {
    setImmediate(async () => {
      const client = new Client();
      await client.initialize();
      setClient(client);
    });
  }, []);

  return client
    ? (
      <ClientProvider client={client}>
        <Test />
      </ClientProvider>
    ) : (
      <div>Loading...</div>
    );
};

export const Persistent = () => {
  const [client, setClient] = useState<Client | undefined>();

  useEffect(() => {
    setImmediate(async () => {
      const client = new Client({
        storagePath: 'react-client/storybook',
        storageType: 'chrome'
      });
      await client.initialize();
      setClient(client);
    });
  }, []);

  return client
    ? (
      <ClientProvider client={client}>
        <Test />
      </ClientProvider>
    ) : (
      <div>Loading...</div>
    );
};
