//
// Copyright 2020 DXOS.org
//

import { withKnobs } from '@storybook/addon-knobs';
import React from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import StoryRouter from 'storybook-react-router';

import Box from '@material-ui/core/Box';

import { keyToBuffer } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { useClient, useParties, useParty } from '@dxos/react-client';

import { AppKitProvider } from '../src';
import { pads } from './common';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';

export default {
  title: 'AppKit',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
};

const NoPartyComponent = () => {
  const client = useClient();
  const parties = useParties();

  const keys = client.keyring.keys;

  const handleCreate = async () => {
    await client.echo.createParty();
  };

  return (
    <Box m={2}>
      <p>Create and select a party using the knobs.</p>
      <h2>Keys</h2>
      {keys.map(key => (
        <div key={key.publicKey}>{key.key}</div>
      ))}
      <h2>Parties</h2>
      {parties.map(party => {
        const publicKey = party.key.toString();
        return (<div key={publicKey} className="party-public-key">{publicKey}</div>);
      })}
      <button onClick={handleCreate}>Add Party</button>
    </Box>
  );
};

const PartyComponent = () => {
  const { topic } = useParams();
  const party = useParty(keyToBuffer(topic));

  return (
    <Box m={2}>
      <h1>Party</h1>
      <div>Public Key: {party.key.toHex()}</div>
      <div>DisplayName: {party.displayName}</div>
    </Box>
  );
};

export const withAppKitProvider = () => (
  <AppKitProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
    <Switch>
      <Route path='/:topic' exact component={PartyComponent} />
      <Route path='/' exact component={NoPartyComponent} />
    </Switch>
  </AppKitProvider>
);
