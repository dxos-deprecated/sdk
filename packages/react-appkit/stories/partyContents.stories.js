//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { useClient, useParty } from '@dxos/react-client';
import { keyToString } from '@dxos/crypto';

import { DefaultViewSidebar, PartySettingsDialog } from '../src';
import { WithParty, withPartyDecorators, pads } from './common';
import { useViews } from '../src/hooks';

export default {
  title: 'Party Contents',
  decorators: withPartyDecorators
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

const SidebarComponent = () => {
  const party = useParty();

  const topic = party ? keyToString(party.publicKey) : '';
  const { createView } = useViews(topic);

  if (!party) return null;

  const handleCreateView = () => {
    createView(pads[0].type);
  };

  return (
    <Box m={2}>
      <DefaultViewSidebar />
      <button onClick={handleCreateView}>Add item</button>
    </Box>
  );
};

export const withSidebarItems = () => {
  return (
    <WithParty partyComponent={SidebarComponent} />
  );
};
