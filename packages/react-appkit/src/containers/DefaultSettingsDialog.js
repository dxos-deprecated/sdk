//
// Copyright 2020 DXOS.org
//

import React from 'react';

import SettingsIcon from '@material-ui/icons/Settings';

import ItemSettings from '../components/ItemSettings';

const DefaultSettingsDialog = ({ open, onClose, onCancel, item, viewModel }) => {
  const handleClose = ({ name }) => {
    if (item) {
      viewModel.renameView(item.viewId, name);
    }
    onClose({ name });
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
