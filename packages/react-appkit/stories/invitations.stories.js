//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import StoryRouter from 'storybook-react-router';
import { withKnobs } from '@storybook/addon-knobs';

import { ErrorHandler } from '@dxos/debug';

import { AppKitContextProvider, BotDialog } from '../src';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';
import { pads, NoPartyComponent } from './common';

export default {
  title: 'Invitations',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
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
    <AppKitContextProvider initialState={{}} errorHandler={new ErrorHandler()} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={BotDialogComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitContextProvider>
  );
};
