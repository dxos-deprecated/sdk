//
// Copyright 2020 DXOS.org
//

import React from 'react';

import SettingsIcon from '@material-ui/icons/Settings';

import ItemSettings from '../components/ItemSettings';

const DefaultSettingsDialog = ({ open, onClose, onCancel, item, itemModel, Icon }) => {
  const handleClose = ({ name }) => {
    if (item) {
      itemModel.renameItem(item.itemId, name);
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
      icon={Icon ? <Icon /> : <SettingsIcon />}
    />
  );
};

export default DefaultSettingsDialog;
