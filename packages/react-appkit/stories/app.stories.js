//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import StoryRouter from 'storybook-react-router';
import { withKnobs } from '@storybook/addon-knobs';

import { keyToString } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { useClient, useParties, useParty } from '@dxos/react-client';

import { AppKitContextProvider } from '../src';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';
import { pads } from './common';

export default {
  title: 'AppKit',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
};

const NoPartyComponent = () => {
  const client = useClient();
  const parties = useParties();

  const keys = client.keyring.keys;

  return (
    <Box m={2}>
      <p>Create and select a party using the knobs.</p>
      <h2>Keys</h2>
      {keys.map(key => (
        <div key={key.publicKey}>{keyToString(key.publicKey)}</div>
      ))}
      <h2>Parties</h2>
      {parties.map(party => {
        const publicKey = keyToString(party.publicKey);
        return (<div key={publicKey}>{publicKey}</div>);
      })}
    </Box>
  );
};

const PartyComponent = () => {
  const party = useParty();

  return (
    <Box m={2}>
      <h1>Party</h1>
      <div>Public Key: {keyToString(party.publicKey)}</div>
      <div>DisplayName: {party.displayName}</div>
    </Box>
  );
};

export const withAppKitProvider = () => (
  <AppKitContextProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
    <Switch>
      <Route path='/:topic' exact component={PartyComponent} />
      <Route path='/' exact component={NoPartyComponent} />
    </Switch>
  </AppKitContextProvider>
);
