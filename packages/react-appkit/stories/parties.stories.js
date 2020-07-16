//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { createKeyPair } from '@dxos/crypto';

import { NewPartyCard, PartyCard } from '../src/components';

export default {
  title: 'Parties'
};

export const withNewPartyCard = () => {
  return (
    <Box m={2}>
      <NewPartyCard onNewParty={() => {}} />
    </Box>
  );
};

export const withPartyCard = () => {
  const mockParty = {
    subscribed: true,
    publicKey: createKeyPair().publicKey,
    members: [],
    displayName: 'A Party Card'
  };

  const mockRouter = {
    push: () => {}
  };

  const mockClient = {
    partyManager: {
      subscribe: () => {},
      unsubscribe: () => {},
      setPartyProperty: () => {},
      getContacts: () => []
    }
  };

  const mockViewModel = {
    getAllViews: () => [],
    getAllDeletedViews: () => [],
    deleteView: () => {},
    restoreView: () => {}
  };

  return (
    <>
      <Box m={2}>
        <PartyCard
          party={mockParty}
          viewModel={mockViewModel}
          router={mockRouter}
          client={mockClient}
          pads={[]}
          createView={() => {}}
        />
      </Box>
      <Box m={2}>
        <PartyCard
          party={{ ...mockParty, displayName: 'A super very long party name that does not fit' }}
          viewModel={mockViewModel}
          router={mockRouter}
          client={mockClient}
          pads={[]}
          createView={() => {}}
        />
      </Box>
    </>
  );
};
