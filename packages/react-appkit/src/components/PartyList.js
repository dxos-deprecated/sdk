//
// Copyright 2020 DXOS.org
//

import React from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import FolderIcon from '@material-ui/icons/FolderOpen';

import { humanize } from '@dxos/crypto';

const useStyles = makeStyles(() => ({
  icon: {
    minWidth: 48
  },

  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
}));

const PartyList = ({ parties = [], selected, onSelect }) => {
  const classes = useStyles();

  const onSelectParty = topic => {
    if (topic !== selected) {
      onSelect(topic);
    }
  };

  return (
    <List>
      {parties.map(({ topic }) => (
        <ListItem
          button
          key={topic}
          onClick={() => onSelectParty(topic)}
          selected={topic === selected}
        >
          <ListItemIcon className={classes.icon}>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText
            classes={{
              secondary: classes.ellipsis
            }}
            secondary={humanize(topic)} // TODO(burdon): Humanize makes no sense in the UX.
          />
        </ListItem>
      ))}
    </List>
  );
};

export default PartyList;
