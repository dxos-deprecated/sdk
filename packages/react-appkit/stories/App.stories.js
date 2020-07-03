//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { storiesOf } from '@storybook/react';
import StoryRouter from 'storybook-react-router';

import { ErrorHandler } from '@dxos/debug';
import { ClientContextProvider } from '@dxos/react-client';

import { AppKitContextProvider } from '../src/containers';

// TODO(burdon): Dummy client (in-memory).
const config = {};

const initialState = {};

const Test = () => <div>Test</div>;

storiesOf('AppKit', module)
  .addDecorator(StoryRouter())
  .add('Test', () => (
    <ClientContextProvider config={config}>
      <AppKitContextProvider initialState={initialState} errorHandler={new ErrorHandler()}>
        <Switch>
          <Route path='/' component={Test} />
        </Switch>
      </AppKitContextProvider>
    </ClientContextProvider>
  ));
