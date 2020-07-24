//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import StoryRouter from 'storybook-react-router';
import { storiesOf } from '@storybook/react';

import Box from '@material-ui/core/Box';

import { keyToString } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { ClientContextProvider, useClient } from '@dxos/react-client';

import { AppKitContextProvider } from '../src';

import { config } from './config';

const initialState = {};

const Test = () => {
  const client = useClient();

  // TODO(burdon): ReferenceError: Cannot access before initialization.
  // const parties = useParties();

  const keys = client.keyring.keys;

  return (
    <Box m={2}>
      <h1>Keys</h1>
      {keys.map(key => (
        <div key={key.publicKey}>{keyToString(key.publicKey)}</div>
      ))}
    </Box>
  );
};

storiesOf('Appkit', module)

  // TODO(burdon): Create party before initializing ClientContextProvider.
  .addDecorator(StoryRouter())

  .add('Context provider', () => (
    <ClientContextProvider config={config}>
      <AppKitContextProvider initialState={initialState} errorHandler={new ErrorHandler()}>
        <Switch>
          <Route path='/' component={Test} />
        </Switch>
      </AppKitContextProvider>
    </ClientContextProvider>
  ));
