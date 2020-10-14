//
// Copyright 2020 DXOS.org
//
import { screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
// import leveljs from 'level-js';
import PartyMemberList from '../src/components/PartyMemberList';
import { renderWithTheme } from './test-utils';
// import ram from 'random-access-memory';

// import { Client } from '@dxos/client';
// import { createStorage } from '@dxos/random-access-multi-storage';
// import { Keyring, KeyStore } from '@dxos/credentials';
// import { ClientProvider } from '@dxos/react-client';

// import enzyme, {shallow} from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// enzyme.configure({ adapter: new Adapter() });

describe.only('PartyMemberList', () => {
  // const client = new Client({
  //   storage: ram,
  //   swarm: {
  //     signal: 'wss://signal2.dxos.network/dxos/signal'
  //   }
  // });

  test('Avatars displays first letter of name or face icon', async () => {
    const party = {
      members: [
        { publicKey: '456583c43cea8ad2903d360349a7d421f513e230ab481f26c9febc5f89ecd379', displayName: 'John' },
        { publicKey: 'a6c80b20e60ad2fcaefbfa79065e834e375f2c68be907f1956348dfd1de404ea', displayName: '' }
      ]
    };
    // const party = await client.partyManager.createParty()

    const props = {
      party: party,
      onShare: () => null
    };

    renderWithTheme(<PartyMemberList {...props} />);

    const avatars = screen.getAllByTestId('avatar');
    const faceIcon = screen.getByTestId('face-icon');

    expect(avatars.length).toEqual(2);
    expect(faceIcon).not.toBeFalsy();
    expect(avatars[0]).toHaveTextContent('J');
    expect(avatars[1]).toContainElement(faceIcon);
  });
});
