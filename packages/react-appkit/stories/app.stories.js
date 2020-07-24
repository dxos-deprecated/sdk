//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import StoryRouter from 'storybook-react-router';

import Box from '@material-ui/core/Box';

import { keyToString } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { useClient } from '@dxos/react-client';

import { WithClientWithWallet } from './decorators';

import { AppKitContextProvider } from '../src';

export default {
  title: 'App',
  decorators: [StoryRouter(), WithClientWithWallet]
};

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

export const withAppKitProvider = () => (
  <AppKitContextProvider initialState={initialState} errorHandler={new ErrorHandler()}>
    <Switch>
      <Route path='/' component={Test} />
    </Switch>
  </AppKitContextProvider>
);
