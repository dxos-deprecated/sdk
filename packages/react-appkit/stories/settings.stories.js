//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { ViewSettingsDialog } from '../src/components';

export default {
  title: 'Settings'
};

export const withViewSettingsDialog = () => {
  const mockViewModel = {
    getAllViews: () => [],
    getAllDeletedViews: () => [],
    deleteView: () => {},
    restoreView: () => {},
    getById: () => ({ displayName: 'Some view', type: 'PAD_TYPE' })
  };

  return (
    <>
      <Box m={2}>
        <ViewSettingsDialog
          open
          onClose={() => {}}
          viewModel={mockViewModel}
          pads={[{ type: 'PAD_TYPE', displayName: 'A mock type' }]}
          viewId='some-id'
        />
      </Box>
    </>
  );
};
