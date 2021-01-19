//
// Copyright 2020 DXOS.org
//

import { screen } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import { Client } from '@dxos/client';
import { createKeyPair } from '@dxos/crypto';

import PartyMemberList from '../src/components/PartyMemberList';
import { renderWithTheme } from './test-utils';

describe('Party Member List', () => {
  const client = new Client();

  test('Avatars displays first letter of name', async () => {
    await client.initialize();
    const keypair = createKeyPair();
    await client.createProfile({ ...keypair, username: 'Tester' });
    await client.echo.open();
    const party = await client.echo.createParty();

    const props = {
      party: party,
      onShare: () => null
    };

    renderWithTheme(<PartyMemberList {...props} />);

    const avatars = screen.getAllByTestId('avatar');

    expect(avatars.length).toEqual(1);
    expect(avatars[0]).toHaveTextContent('T');
  });
});
