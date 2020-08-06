//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { BotDialog } from '../src/components';
import { WithParty, withPartyDecorators } from './common';

export default {
  title: 'Invitations',
  decorators: withPartyDecorators
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
    <WithParty partyComponent={BotDialogComponent} />
  );
};
