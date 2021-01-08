//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';
import Icon from '@material-ui/icons/Settings';

import { ItemSettings } from '../src';

export default {
  title: 'Items'
};

const mockItem = {
  model: {
    getProperty: (propertyName) => propertyName
  }
};

export const withItemSettingsDialog = () => {
  return (
    <Box m={2}>
      <ItemSettings
        open
        onClose={() => null}
        onCancel={() => null}
        item={mockItem}
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
        onClose={() => null}
        onCancel={() => null}
        item={mockItem}
        closingDisabled
        icon={<Icon />}
      >
        <p>Pad Specific content</p>
      </ItemSettings>
    </Box>
  );
};
