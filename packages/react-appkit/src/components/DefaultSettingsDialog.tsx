//
// Copyright 2020 DXOS.org
//

import React from 'react';

import SettingsIcon from '@material-ui/icons/Settings';

import ItemSettings from './ItemSettings';

const DefaultSettingsDialog = ({
  open,
  onClose,
  onCancel,
  item
}: {
  open: boolean,
  onClose: ({ name }: { name: string }) => void,
  onCancel: () => void,
  item: any
}) => {
  const handleClose = ({ name }: { name: string }) => {
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
