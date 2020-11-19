//
// Copyright 2020 DXOS.org
//

import { createKeyPair } from '@dxos/crypto';

import { Client } from './client';

test('client initialize', async () => {
  const client = new Client();
  await client.initialize();

  console.log('test 1');

  // TODO(burdon): Profiling (takes 6s).
  // TODO(burdon): What if not provided?
  const keypair = createKeyPair();
  await client.createProfile({ ...keypair, username: 'testuser' });

  expect(client.hasProfile()).toBeTruthy();
  expect(client.getProfile()).toBeDefined();

  // TODO(burdon): Test has closed.
  await client.destroy();
});

// TODO(burdon): Skipped.
test.skip('client idempotent calls', async () => {
  const client = new Client();
  await client.initialize();
  await client.initialize();

  const keypair = createKeyPair();
  await client.createProfile({ ...keypair, username: 'testuser' });
  expect(client.hasProfile()).toBeTruthy(); // TODO(burdon): Remove -- just access profile property.
  // TODO(burdon): Fails.
  //   This is a bad error message: Why mention halo party?
  //   Identity key already exists. Call createProfile without a keypair to only create a halo party.
  await client.createProfile({ ...keypair, username: 'testuser' });

  expect(client.hasProfile()).toBeTruthy();
  expect(client.getProfile()).toBeDefined();

  await client.destroy();
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

test('persistent storage', async () => {
  const client = new Client({
    storage: {
      persistent: true,
      path: `/tmp/dxos-${Date.now()}`
    }
  });

  await client.initialize();

  const keypair = createKeyPair();
  await client.createProfile({ ...keypair, username: 'foo' });

  expect(client.getProfile()).toBeDefined();

  await client.destroy();
});
