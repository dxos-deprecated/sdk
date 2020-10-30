//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import { createKeyPair } from '@dxos/crypto';
import { useClient } from '@dxos/react-client';

import { ClientInitializer } from '../../src/containers/ClientInitializer';
import { config } from '../common';

export const WithClientAndIdentity = (story) => {
  return (
    <ClientInitializer config={config}>
      <RenderProvider story={story} />
    </ClientInitializer>
  );
};

function RenderProvider ({ story }) {
  const [ready, setReady] = useState(false);
  const client = useClient();

  useEffect(() => {
    (async () => {
      await client.createProfile({ ...createKeyPair(), username: 'foo' });
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <div className='WithClientDecorator'>{story()}</div>
  );
}
