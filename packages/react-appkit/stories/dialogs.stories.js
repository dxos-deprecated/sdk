//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { ViewSettingsDialog } from '../src/components';

export default {
  title: 'Dialogs'
};

export const withViewSettingsDialog = () => {
  // TODO(burdon): Should not require this.
  const mockViewModel = {
    getById: () => ({ displayName: 'Test Item' })
  };

  return (
    <>
      <Box m={2}>
        <ViewSettingsDialog
          open
          viewId='test-id'
          viewModel={mockViewModel}
          onClose={() => {}}
        />
      </Box>
    </>
  );
};
