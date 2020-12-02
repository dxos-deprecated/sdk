//
// Copyright 2020 DXOS.org
//

import React from 'react';

import SettingsIcon from '@material-ui/icons/Settings';

import ItemSettings from './ItemSettings';

const DefaultSettingsDialog = ({ open, onClose, onCancel, item }) => {
  const handleClose = ({ name }) => {
    if (item) {
      item.model.setProperty('title', name);
    }
    onClose({ name: name || 'untitled' });
  };

  return (
    <ItemSettings
      open={open}
      item={item}
      icon={<SettingsIcon />}
      closingDisabled={false}
      onClose={handleClose}
      onCancel={onCancel}
    />
  );
};

export default DefaultSettingsDialog;
