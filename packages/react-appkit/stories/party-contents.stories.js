//
// Copyright 2020 DXOS.org
//

import { withKnobs } from '@storybook/addon-knobs';
import React, { useState } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import StoryRouter from 'storybook-react-router';

import Box from '@material-ui/core/Box';

import { keyToBuffer } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { ObjectModel } from '@dxos/object-model';
import { useClient, useParty } from '@dxos/react-client';

import { AppKitProvider, DefaultItemList, PartySettingsDialog } from '../src';
import { NoPartyComponent, pads } from './common';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';

export default {
  title: 'Party Contents',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
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
    <AppKitProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={PartySettingsComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitProvider>
  );
};

const SidebarComponent = () => {
  const { topic } = useParams();
  const party = useParty(keyToBuffer(topic));

  if (!party) {
    return null;
  }

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
    <AppKitProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={SidebarComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitProvider>
  );
};
