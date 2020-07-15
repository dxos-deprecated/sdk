//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { storiesOf } from '@storybook/react';
import StoryRouter from 'storybook-react-router';

import { ErrorHandler } from '@dxos/debug';
import { ClientContextProvider, useClient } from '@dxos/react-client';

import { AppKitContextProvider } from '../src';

// TODO(burdon): Goal to test context provider (currently doesn't work).
// TODO(burdon): Dummy client (in-memory).
const config = {};

const initialState = {};

const Test = () => {
  // TODO(burdon): useClient returns null initially.
  const client = useClient();
  console.log(client);

  return (
    <div>
      <pre>{client && client.config}</pre>
    </div>
  );
};

storiesOf('AppKit', module)

  // TODO(burdon): Not working?
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
