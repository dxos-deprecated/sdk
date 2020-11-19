//
// Copyright 2020 DXOS.org
//

import { createKeyPair } from '@dxos/crypto';

import { Client } from './client';

test('initialize', async () => {
  const client = new Client();
  await client.initialize();

  // TODO(burdon): Profiling (takes 6s).
  // TODO(burdon): What if not provided?
  const keypair = createKeyPair();
  await client.createProfile({ ...keypair, username: 'testuser' });

  expect(client.hasProfile()).toBeTruthy();
  expect(client.getProfile()).toBeDefined();

  // TODO(burdon): Test has closed.
  await client.destroy();
});

test('initialize and destroy are idempotent', async () => {
  const client = new Client();
  await client.initialize();
  await client.initialize();

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

test('creating profile twice throws an error', async () => {
  const client = new Client();
  await client.initialize();

  const keypair = createKeyPair();
  await client.createProfile({ ...keypair, username: 'testuser' });
  await expect(client.createProfile({ ...keypair, username: 'testuser' })).rejects.toThrow();

  await client.destroy();
});
