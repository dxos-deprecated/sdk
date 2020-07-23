//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import StoryRouter from 'storybook-react-router';

import Box from '@material-ui/core/Box';

import { createId } from '@dxos/crypto';
import { ClientContextProvider, useClient, useParty } from '@dxos/react-client';

import { BotDialog, PartySettingsDialog } from '../src/components';

import { config } from './config';

// TODO(burdon): Create party.
const topic = createId();

export default {
  title: 'Invitations',
  decorators: [
    new StoryRouter(null, {
      initialEntries: [`/${topic}`]
    })
  ]
};

// TODO(burdon): Fix useRegistry to use Registry object created in context.
export const withBotDialog = () => {
  return (
    <Box m={2}>
      <BotDialog
        open
        onClose={() => {}}
      />
    </Box>
  );
};

// TODO(burdon): Consistency with dialogs as either components or containers (with hooks).
const FakePartySettingsDialog = () => {
  const client = useClient();
  const party = useParty();
  console.log(party);

  // TODO(burdon): Cannot work until able to set party before initialization (see app.stories.js).
  return null;
  return (
    <PartySettingsDialog
      client={client}
      party={party}
      open={true}
      onClose={() => {}}
    />
  );
};

export const withPartySettingsDialog = () => {
  return (
    <ClientContextProvider config={config}>
      <Box m={2}>
        <Switch>
          <Route path='/:topic' component={FakePartySettingsDialog} />
        </Switch>
      </Box>
    </ClientContextProvider>
  );
};
