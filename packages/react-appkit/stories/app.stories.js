//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { WithParty, withPartyDecorators } from './common';

export default {
  title: 'AppKit',
  decorators: withPartyDecorators
};

export const withAppKitProvider = () => (
  <WithParty />
);
