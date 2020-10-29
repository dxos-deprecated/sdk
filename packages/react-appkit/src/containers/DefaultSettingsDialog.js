//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Chance } from 'chance';

import SettingsIcon from '@material-ui/icons/Settings';

import ItemSettings from '../components/ItemSettings';

const chance = new Chance();

const DefaultSettingsDialog = ({ open, onClose, onCancel, item }) => {
  const handleClose = ({ name }) => {
    if (item) {
      item.model.setProperty('title', name);
    }
    onClose({ name: name || `item-${chance.word()}` });
  };

  return (
    <ItemSettings
      open={open}
      onClose={handleClose}
      onCancel={onCancel}
      item={item}
      closingDisabled={false}
      icon={<SettingsIcon />}
    />
  );
};

export default DefaultSettingsDialog;
