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

  await client.destroy();
});

test('creating profile returns the profile', async () => {
  const client = new Client();

  await client.initialize();

  const keypair = createKeyPair();
  const profile = await client.createProfile({ ...keypair, username: 'foo' });

  expect(profile).toBeDefined();
  expect(profile?.username).toEqual('foo');

  await client.destroy();
});
