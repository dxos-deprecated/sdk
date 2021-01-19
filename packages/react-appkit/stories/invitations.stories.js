//
// Copyright 2020 DXOS.org
//

import { withKnobs } from '@storybook/addon-knobs';
import React, { useState } from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import StoryRouter from 'storybook-react-router';

import { sleep } from '@dxos/async';
import { keyToBuffer } from '@dxos/crypto';
import { ErrorHandler } from '@dxos/debug';
import { useClient, useParty } from '@dxos/react-client';

import {
  useAppRouter,
  AppKitProvider,
  BotDialog,
  PartySharingDialog,
  RedeemDialog,
  Theme
} from '../src';
import { pads, NoPartyComponent } from './common';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';

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
    if (bot.includes('will-hang')) {
      return new Promise(() => null);
    }
    if (bot.includes('will-fail')) {
      throw new Error('Failed deploy');
    }
    setDeployed(true);
    setOpen(false);
  };

  return (
    <Theme>
      <BotDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
      {deployed && (<p>Successfully deployed!</p>)}
    </Theme>
  );
};

export const withBotDialog = () => {
  return (
    <AppKitProvider initialState={{}} errorHandler={errorHandler} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={BotDialogComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitProvider>
  );
};

const PartySharingComponent = () => {
  const [open, setOpen] = useState(true);
  const { topic } = useParams();
  const party = useParty(keyToBuffer(topic));
  const client = useClient();
  const router = useAppRouter();

  return (
    <Theme>
      <PartySharingDialog
        party={party}
        client={client}
        open={open}
        onClose={() => setOpen(false)}
        router={router}
      />
    </Theme>
  );
};

export const withPartySharing = () => {
  return (
    <AppKitProvider initialState={{}} errorHandler={errorHandler} pads={pads}>
      <Switch>
        <Route path='/:topic' exact component={PartySharingComponent} />
        <Route path='/' exact component={NoPartyComponent} />
      </Switch>
    </AppKitProvider>
  );
};

export const withRedeemInvitation = () => {
  return (
    <Theme>
      <RedeemDialog onClose={() => null} />
    </Theme>
  );
};
