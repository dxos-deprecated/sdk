//
// Copyright 2020 DXOS.org
//

import { createKeyPair } from '@dxos/crypto';

import { Client } from './client';

test('client initialize', async () => {
  const client = new Client();

  await client.initialize();

  const keypair = createKeyPair();
  await client.createProfile({ ...keypair, username: 'foo' });

  expect(client.getProfile()).toBeDefined();
});
