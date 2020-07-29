//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withKnobs } from '@storybook/addon-knobs';
import StoryRouter from 'storybook-react-router';

import Box from '@material-ui/core/Box';

import { keyToString } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { useClient, useParties, useParty } from '@dxos/react-client';

import { WithClientAndIdentity, WithPartyKnobs } from './decorators';

import { AppKitContextProvider } from '../src';

export default {
  title: 'AppKit',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
};

const initialState = {};

const Test = () => {
  const client = useClient();
  const parties = useParties();

  const keys = client.keyring.keys;

  return (
    <Box m={2}>
      <h1>Keys</h1>
      {keys.map(key => (
        <div key={key.publicKey}>{keyToString(key.publicKey)}</div>
      ))}
      <h1>Parties</h1>
      {parties.map(party => {
        const publicKey = keyToString(party.publicKey);
        return (<div key={publicKey}>{publicKey}</div>);
      })}
    </Box>
  );
};

const TestWithParty = () => {
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
  <AppKitContextProvider initialState={initialState} errorHandler={new ErrorHandler()}>
    <Switch>
      <Route path='/:topic' exact component={TestWithParty} />
      <Route path='/' exact component={Test} />
    </Switch>
  </AppKitContextProvider>
);
