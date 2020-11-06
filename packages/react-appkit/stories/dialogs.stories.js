//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import StoryRouter from 'storybook-react-router';

import { RedeemDialog, Theme } from '../src';
import { WithClientAndIdentity, WithPartyKnobs } from './decorators';

export default {
  title: 'Dialogs',
  decorators: [WithPartyKnobs, WithClientAndIdentity, StoryRouter(), withKnobs]
};

export const withRedeemDialog = () => {
  return (
    <Theme>
      <RedeemDialog onClose={() => {}} />
    </Theme>
  );
};
