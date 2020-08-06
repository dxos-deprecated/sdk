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

import { WithClientAndIdentity, WithPartyKnobs } from '../decorators';
import { AppKitContextProvider } from '../../src';
import { pads } from './';

export const withPartyDecorators = [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs];

const DefaultNoPartyComponent = () => {
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

const DefaultPartyComponent = () => {
  const party = useParty();

  return (
    <Box m={2}>
      <h1>Party</h1>
      <div>Public Key: {keyToString(party.publicKey)}</div>
      <div>DisplayName: {party.displayName}</div>
    </Box>
  );
};

/**
 * This provides the default story boiler plate for selecting parties.
 * To use with exported list of decorators.
 * @param {Component} noPartyComponent - component to render if there is no party selected
 * @param {Component} partyComponent - component to render if there is a party selected
 */
export const WithParty = ({ noPartyComponent, partyComponent }) => (
  <AppKitContextProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
    <Switch>
      <Route path='/:topic' exact component={partyComponent ?? DefaultPartyComponent} />
      <Route path='/' exact component={noPartyComponent ?? DefaultNoPartyComponent} />
    </Switch>
  </AppKitContextProvider>
);
