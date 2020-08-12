//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import StoryRouter from 'storybook-react-router';
import { withKnobs } from '@storybook/addon-knobs';

import { keyToString } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { useClient, useParty } from '@dxos/react-client';

import { AppKitContextProvider, useItems, DefaultItemList, PartySettingsDialog } from '../src';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';
import { pads, NoPartyComponent } from './common';

export default {
  title: 'Party Contents',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
};

// TODO(burdon): Consistency with dialogs as either components or containers (with hooks).
const PartySettingsComponent = () => {
  const client = useClient();
  const party = useParty();
  const [open, setOpen] = useState(true);

  return (
    <Box m={2}>
      <PartySettingsDialog
        client={client}
        party={party}
        open={open}
        onClose={() => setOpen(false)}
      />
    </Box>
  );
};

export const withPartySettingsDialog = () => {
  return (
    <AppKitContextProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={PartySettingsComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitContextProvider>
  );
};

const SidebarComponent = () => {
  const party = useParty();

  const topic = party ? keyToString(party.publicKey) : '';
  const { createItem } = useItems(topic);

  if (!party) return null;

  const handleCreateItem = () => {
    createItem(pads[0].type);
  };

  return (
    <Box m={2}>
      <DefaultItemList />
      <button onClick={handleCreateItem}>Add item</button>
    </Box>
  );
};

export const withSidebarItems = () => {
  return (
    <AppKitContextProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={SidebarComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitContextProvider>
  );
};
