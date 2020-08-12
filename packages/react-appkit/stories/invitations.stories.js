//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import StoryRouter from 'storybook-react-router';
import { withKnobs } from '@storybook/addon-knobs';

import { ErrorHandler } from '@dxos/debug';

import { AppKitContextProvider, BotDialog } from '../src';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';
import { pads, NoPartyComponent } from './common';

const errorHandler = new ErrorHandler();

export default {
  title: 'Invitations',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
};

const BotDialogComponent = () => {
  const [open, setOpen] = useState(true);
  const [deployed, setDeployed] = useState(false);

  const handleSubmit = ({ bot }) => {
    if (bot.includes('will-hang')) return;
    if (bot.includes('will-fail')) throw new Error('Failed deploy');
    setDeployed(true);
    setOpen(false);
  };

  return (
    <Box m={2}>
      <BotDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
      {deployed && (<p>Successfully deployed!</p>)}
    </Box>
  );
};

// TODO(burdon): Fix useRegistry to use Registry object created in context.
export const withBotDialog = () => {
  return (
    <AppKitContextProvider initialState={{}} errorHandler={errorHandler} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={BotDialogComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitContextProvider>
  );
};
