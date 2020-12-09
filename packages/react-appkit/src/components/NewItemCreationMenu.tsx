//
// Copyright 2020 DXOS.org
//

import React from 'react';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { SvgIconTypeMap } from '@material-ui/core';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';

type NewItemCreationMenuPropsType = {
  anchorEl: Element | undefined,
  onSelect: (padType: string) => void,
  open: boolean,
  onClose: () => void,
  pads: { type: string, displayName: string, description: string, icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>}[]
}

const NewItemCreationMenu = ({ anchorEl, onSelect, open, onClose, pads }: NewItemCreationMenuPropsType) => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {pads.map(pad => (
        <MenuItem button key={pad.type} onClick={() => onSelect(pad.type)}>
          <ListItemIcon>
            <pad.icon />
          </ListItemIcon>
          <ListItemText primary={pad.displayName} secondary={pad.description} />
        </MenuItem>
      ))}
    </Menu>
  );
};

export default NewItemCreationMenu;
