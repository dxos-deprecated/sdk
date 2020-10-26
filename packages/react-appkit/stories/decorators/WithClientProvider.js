//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';

import { Client } from '@dxos/client';
import { ClientProvider, useClient } from '@dxos/react-client';
import { createStorage } from '@dxos/random-access-multi-storage';
import { createKeyPair } from '@dxos/crypto';
import { Keyring, KeyType } from '@dxos/credentials';
import { createSchema, Registry, DEFAULT_CHAIN_ID } from '@wirelineio/registry-client';
import { config, registryData } from '../common';
import { ClientInitializer } from '../../src/containers/ClientInitializer';

export const WithClientAndIdentity = (story) => {
  return (
    <ClientInitializer config={config}>
      <RenderProvider story={story} />
    </ClientInitializer>
  );
};


function RenderProvider ({ story, }) {
  const [ready, setReady] = useState(false);
  const client = useClient();

  useEffect(() => {
    (async () => {
      await client.createProfile({ ...createKeyPair(), username: 'foo' })
      setReady(true);
    })();
  }, [])

  if(!ready) {
    return null
  }

  return (
    <div className='WithClientDecorator'>{story()}</div>
  );
}
