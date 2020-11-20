//
// Copyright 2020 DXOS.org
//

import { screen, render } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { Client } from '@dxos/client';
import { createKeyPair } from '@dxos/crypto';

import { useClient } from '../hooks';
import { ClientProvider } from './ClientProvider';

const TestComponent = () => {
  const client = useClient();
  return (<>
    <div>Hello World</div>
    <div>{`Client is: ${client ? 'defined' : 'NOT there'}`}</div>
  </>);
};

describe('ClientProvider', () => {
  const client = new Client();

  test('Renders with children', async () => {
    await client.initialize();
    const keypair = createKeyPair();
    await client.createProfile({ ...keypair, username: 'Tester' });
    await client.echo.open();

    render(
      <ClientProvider client={client}>
        <TestComponent />
      </ClientProvider>
    );

    expect(() => screen.getByText('Hello World')).not.toThrow();
    expect(() => screen.getByText('Client is defined')).not.toThrow();
    expect(() => screen.getByText('Client is NOT there')).toThrow();
  });
});
