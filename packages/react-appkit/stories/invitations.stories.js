//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import StoryRouter from 'storybook-react-router';
import { withKnobs } from '@storybook/addon-knobs';

import Box from '@material-ui/core/Box';

import { createId } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { useClient, useParty, ClientContextProvider } from '@dxos/react-client';

import { BotDialog, PartySettingsDialog } from '../src/components';

import { WithClient, WithPartyKnobs, WithClientAndIdentity } from './decorators';

import { AppKitContextProvider } from '../src';

// TODO(burdon): Create party.
const topic = createId();

export default {
  title: 'Invitations',
  decorators: [
    WithPartyKnobs,
    WithClientAndIdentity,
    new StoryRouter(null, {
      initialEntries: [`/${topic}`]
    }),
    WithClient,
    withKnobs
  ]
};

const BotDialogComponent = () => {
  return (
    <Box m={2}>
      <BotDialog
        open
        onClose={() => {}}
      />
    </Box>
  );
};

// TODO(burdon): Fix useRegistry to use Registry object created in context.
export const withBotDialog = () => {
  return (
    <ClientContextProvider config={{ services: { wns: { server: 'http://example.com', chainId: 'example' } } }}>
      <AppKitContextProvider initialState={{}} errorHandler={new ErrorHandler()}>
        <Switch>
          <Route path='/' component={BotDialogComponent} />
        </Switch>
      </AppKitContextProvider>
    </ClientContextProvider>
  );
};

// TODO(burdon): Consistency with dialogs as either components or containers (with hooks).
const PartyComponent = () => {
  const client = useClient();
  const party = useParty();

  return (
    <Box m={2}>
      <PartySettingsDialog
        client={client}
        party={party}
        open
        onClose={() => {}}
      />
    </Box>
  );
};

const HomeComponent = () => (<p>Select a party using knobs</p>);

export const withPartySettingsDialog = () => {
  return (
    <AppKitContextProvider initialState={{}} errorHandler={new ErrorHandler()}>
      <Switch>
        <Route path='/:topic' component={PartyComponent} />
        <Route path='/' exact component={HomeComponent} />
      </Switch>
    </AppKitContextProvider>
  );
};
