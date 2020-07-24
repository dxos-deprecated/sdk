//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';
import Icon from '@material-ui/icons/Settings';

import { ItemSettings } from '../src/components';

export default {
  title: 'Items'
};

export const withItemSettingsDialog = () => {
  return (
    <Box m={2}>
      <ItemSettings
        open
        onClose={() => {}}
        onCancel={() => {}}
        item={{ displayName: 'an item' }}
        closingDisabled
        icon={<Icon />}
      />
    </Box>
  );
};

export const withPadSpecificItemSettingsDialog = () => {
  return (
    <Box m={2}>
      <ItemSettings
        open
        onClose={() => {}}
        onCancel={() => {}}
        item={{ displayName: 'an item' }}
        closingDisabled
        icon={<Icon />}
      >
        <p>Pad Specific content</p>
      </ItemSettings>
    </Box>
  );
};
