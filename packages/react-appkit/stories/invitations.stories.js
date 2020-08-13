//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import StoryRouter from 'storybook-react-router';
import { withKnobs } from '@storybook/addon-knobs';

import { sleep } from '@dxos/async';
import { ErrorHandler } from '@dxos/debug';

import { AppKitContextProvider, BotDialog, AuthenticatorDialog } from '../src';
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

  const handleSubmit = async ({ bot }) => {
    await sleep(1000);
    if (bot.includes('will-hang')) return new Promise(() => {});
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

export const withAuthenticatorDialog = () => {
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(true);

  if (!open) {
    return <p>Canceled.</p>;
  }

  if (submitted) {
    return <p>Submitted!</p>;
  }

  return (
    <Box m={2}>
      <AuthenticatorDialog
        onCancel={() => setOpen(false)}
        onSubmit={() => setSubmitted(true)}
      />
    </Box>
  );
};

export const withAuthenticatorDialogKnownFlow = () => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return <p>Canceled.</p>;
  }

  return (
    <Box m={2}>
      <AuthenticatorDialog
        onCancel={() => setOpen(false)}
        isOfflineKeyInvitation
      />
    </Box>
  );
};

export const withAuthenticatorDialogError = () => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return <p>Canceled.</p>;
  }

  return (
    <Box m={2}>
      <AuthenticatorDialog
        error='Something really bad has happened'
        onCancel={() => setOpen(false)}
        onSubmit={() => {}}
      />
    </Box>
  );
};
