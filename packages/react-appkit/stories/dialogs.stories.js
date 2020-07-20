//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';
import Icon from '@material-ui/icons/Settings';

import { ViewSettingsDialog, ItemSettings } from '../src/components';

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

export const withItemSettingsDialog = () => {
  return (
    <>
      <Box m={2}>
        <ItemSettings
          open
          onClose={() => {}}
          onCancel={() => {}}
          item={{displayName: 'an item'}}
          closingDisabled={true}
          icon={<Icon/>}
        />
      </Box>
    </>
  );
};

export const withPadSpecificItemSettingsDialog = () => {
  return (
    <>
      <Box m={2}>
        <ItemSettings
          open
          onClose={() => {}}
          onCancel={() => {}}
          item={{displayName: 'an item'}}
          closingDisabled={true}
          icon={<Icon/>}
        >
          <p>Pad Specific content</p>
        </ItemSettings>
      </Box>
    </>
  );
};
