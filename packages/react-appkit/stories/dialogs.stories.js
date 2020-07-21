//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Icon from '@material-ui/icons/Settings';

import { BotDialog, ItemSettings, RegistrationDialog } from '../src/components';

export default {
  title: 'Dialogs'
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

export const withBotDialog = () => (
  <Box m={2}>
    <BotDialog
      open
      onClose={() => {}}
    />
  </Box>
);

export const withRegistration = () => {
  const [open, setOpen] = useState(true);

  const handleFinish = (username, seedPhrase) => {
    console.log(username, seedPhrase);
    setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  return (
    <Box m={2}>
      <RegistrationDialog open={open} onFinish={handleFinish} />
    </Box>
  );
};
