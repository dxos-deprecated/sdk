//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { createKeyPair, keyToString } from '@dxos/crypto';

import { ViewSettings } from '../src/components';

export default {
  title: 'Settings'
};

export const withViewSettings = () => {
  const mockParty = {
    subscribed: true,
    publicKey: createKeyPair().publicKey,
    members: [],
    displayName: 'A Party Card'
  };

  const mockRouter = {
    push: () => {}
  };

  const mockViewModel = {
    getAllViews: () => [],
    getAllDeletedViews: () => [],
    deleteView: () => {},
    restoreView: () => {},
    getById: () => ({ displayName: 'Some view', type: 'PAD_TYPE' })
  };

  const topic = keyToString(mockParty.publicKey);

  return (
    <>
      <Box m={2}>
        <ViewSettings
          router={mockRouter}
          viewModel={mockViewModel}
          topic={topic}
          pads={[{ type: 'PAD_TYPE', displayName: 'A mock type' }]}
          viewId='some-id'
        />
      </Box>
    </>
  );
};
