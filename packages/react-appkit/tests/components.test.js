//
// Copyright 2020 DXOS.org
//
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
// import leveljs from 'level-js';

import PartyMemberList from '../src/components/PartyMemberList';
import AuthenticatorDialog from '../src/components/AuthenticatorDialog';
import Theme from '../src/components/Theme';

// import { Client } from '@dxos/client';
// import { createStorage } from '@dxos/random-access-multi-storage';
// import { Keyring, KeyStore } from '@dxos/credentials';
// import { ClientProvider } from '@dxos/react-client';

// import enzyme, {shallow} from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// enzyme.configure({ adapter: new Adapter() });

const themeBase = {
  // https://material-ui.com/customization/breakpoints/
  breakpoints: {
    values: {
      subMbp: 1600,
      // defaults:
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  }
};

const renderWithTheme = (child) => render(
  <Theme base={themeBase}>
    {child}
  </Theme>
);

describe('PartyMemberList', () => {
  // from client.md
  // const client = new Client({
  //     storage: createStorage('tasks-db'),
  //     keyring: new Keyring(new KeyStore(leveljs('tasks-keys'))),
  //     swarm: {
  //         signal: 'wss://signal2.dxos.network/dxos/signal'
  //     }
  // });

  // test('', async () => {
  //     // const ClientHookHolder = () => {
  //     //     const client = useClient();
  //     //     return <div client={client} />;
  //     // }
  //     // const client = (shallow(<ClientHookHolder/>)).client;
  //     console.log(client)
  //     const party = await client.partyManager.createParty();
  //     console.log(party)
  //     // render(<PartyMemberList/>);
  //     // fireEvent.click(screen.getByRole('button'));
  //     // await waitFor(() => null, { timeout: 50 });
  //     expect(true).toEqual(true)
  //     // expect(screen.getByRole('button')).toHaveTextContent('Clicked!');
  // });

  test('Avatars displays first letter of name or face icon', async () => {
    const party = {
      members: [
        { publicKey: '456583c43cea8ad2903d360349a7d421f513e230ab481f26c9febc5f89ecd379', displayName: 'John' },
        { publicKey: 'a6c80b20e60ad2fcaefbfa79065e834e375f2c68be907f1956348dfd1de404ea', displayName: '' }
      ]
    };

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

describe('AuthenticatorDialog', () => {
  const consoleOutput = [];
  const mockedLog = output => consoleOutput.push(output);
  const originalLog = console.log;

  beforeEach(() => (console.log = mockedLog));
  afterEach(() => (console.log = originalLog));

  test('Passcode input visible and accept values when unknown user', async () => {
    const props = {
      error: null,
      onSubmit: () => null,
      onCancel: () => null,
      isOfflineKeyInvitation: false
    };

    renderWithTheme(<AuthenticatorDialog {...props} />);

    expect(() => screen.getByRole('textbox')).not.toThrow();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1111' } });
    await waitFor(() => null, { timeout: 100 });

    expect(consoleOutput.length).toBeGreaterThan(0);
    expect(consoleOutput[0]).toEqual('Passcode: 1111 [1]');
  });

  test('Passcode input invisible when known user', async () => {
    const props = {
      error: null,
      onSubmit: () => null,
      onCancel: () => null,
      isOfflineKeyInvitation: true
    };

    renderWithTheme(<AuthenticatorDialog {...props} />);

    expect(() => screen.getByRole('textbox')).toThrow();
  });

  // CASE: wrong passcode
});
