//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import StoryRouter from 'storybook-react-router';
import { withKnobs } from '@storybook/addon-knobs';

import { ErrorHandler } from '@dxos/debug';
import { useClient, useParty } from '@dxos/react-client';
import { ObjectModel } from '@dxos/object-model';

import { AppKitContextProvider, DefaultItemList, PartySettingsDialog } from '../src';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';
import { pads, NoPartyComponent } from './common';
import { keyToBuffer } from '@dxos/crypto';

export default {
  title: 'Party Contents',
  decorators: [WithPartyKnobs, StoryRouter(), withKnobs]
};

// TODO(burdon): Consistency with dialogs as either components or containers (with hooks).
const PartySettingsComponent = () => {
  const client = useClient();
  const { topic } = useParams();
  const party = useParty(keyToBuffer(topic));
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
  const { topic } = useParams();
  const party = useParty(keyToBuffer(topic));

  if (!party) return null;

  const handleCreateItem = async () => {
    const itemId = await party.database.createItem({
      model: ObjectModel,
      type: pads[0].type,
      props: {}
    });
    console.log('created:', itemId);
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
