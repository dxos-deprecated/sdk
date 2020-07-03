//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { ClientContextProvider, useClient } from '../src';

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
  return (
    <ClientContextProvider config={clientConfig}>
      <Test />
    </ClientContextProvider>
  );
};

export default ClientStory;
