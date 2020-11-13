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
  AuthenticatorDialog,
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
      return new Promise(() => {});
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
    <Theme>
      <AuthenticatorDialog
        onCancel={() => setOpen(false)}
        onSubmit={() => setSubmitted(true)}
      />
    </Theme>
  );
};

export const withAuthenticatorDialogKnownFlow = () => {
  const [open, setOpen] = useState(true);

  if (!open) {
    return <p>Canceled.</p>;
  }

  return (
    <Theme>
      <AuthenticatorDialog
        onCancel={() => setOpen(false)}
        isOfflineKeyInvitation
      />
    </Theme>
  );
};

const AuthenticatorDialogErrorComponent = () => {
  const [open, setOpen] = useState(true);
  const error = 'ERR_EXTENSION_RESPONSE_FAILED: [responseCode: ERR_EXTENSION_RESPONSE_FAILED [message: [responseCode: ERR_GREET_INVALID_INVITATION] [message: 86a17f482d683a50654926f0d4218c57816c0f85b946386a287f9e424e49fcd6 invalid]]';

  if (!open) {
    return <p>Canceled.</p>;
  }

  return (
    <Theme>
      <AuthenticatorDialog
        error={error}
        onCancel={() => setOpen(false)}
        onSubmit={() => {}}
      />
    </Theme>
  );
};

export const withAuthenticatorDialogError = () => {
  return (
    <AppKitProvider initialState={{}} errorHandler={errorHandler} pads={pads} issuesLink='https://github.com/dxos/sdk/issues/new'>
      <Switch>
        <Route path='/:topic' exact component={AuthenticatorDialogErrorComponent} />
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
      <RedeemDialog onClose={() => {}} />
    </Theme>
  );
};
