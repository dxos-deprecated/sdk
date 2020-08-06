//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { useClient, useParty } from '@dxos/react-client';

import { BotDialog, PartySettingsDialog } from '../src/components';
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

// TODO(burdon): Consistency with dialogs as either components or containers (with hooks).
const PartySettingsComponent = () => {
  const client = useClient();
  const party = useParty();

  return (
    <Box m={2}>
      <PartySettingsDialog
        client={client}
        party={party}
        open
        onClose={() => {}}
      />
    </Box>
  );
};

export const withPartySettingsDialog = () => {
  return (
    <WithParty partyComponent={PartySettingsComponent} />
  );
};
