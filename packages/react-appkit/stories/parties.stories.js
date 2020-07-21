//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { createKeyPair } from '@dxos/crypto';

import { PartyCard } from '../src/components';

export default {
  title: 'Parties'
};

export const withNewPartyCard = () => {
  return (
    <Box m={2}>
      <PartyCard onNewParty={() => {}} />
    </Box>
  );
};

// TODO(burdon): Replace mocks with fakes (i.e., in-memory components).
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
    getAllViews: () => [...new Array(5)].map((_, i) => ({
      viewId: `item-${i}`, type: 'test', displayName: `Item ${i}`
    })),
    getAllDeletedViews: () => [],
    deleteView: () => {},
    restoreView: () => {}
  };

  const parties = [
    mockParty,
    { ...mockParty, displayName: 'A very very very long name' }
  ];

  return (
    <>
      {parties.map((party, i) => (
        <Box key={i} m={2}>
          <PartyCard
            party={party}
            viewModel={mockViewModel}
            router={mockRouter}
            client={mockClient}
            pads={[]}
            createView={() => {}}
          />
        </Box>
      ))}
    </>
  );
};
