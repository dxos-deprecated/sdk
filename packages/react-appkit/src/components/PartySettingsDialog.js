//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { makeStyles } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';

import BuildIcon from '@material-ui/icons/Build';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import UnsubscribeIcon from '@material-ui/icons/Unsubscribe';

import { EditableText } from '@dxos/react-ux';

const useStyles = makeStyles(theme => ({
  title: {
    marginLeft: theme.spacing(2)
  },
  root: {},
  content: {
    minWidth: '500px',
    padding: '50px'
  },
  divider: {
    marginTop: '20px',
    marginBottom: '20px'
  }
}));

const PartySettingsDialog = ({ party, open, onClose, client, deletedItemsVisible, onVisibilityToggle, onUnsubscribe }) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={onClose} className={classes.root}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          <Avatar>
            <BuildIcon />
          </Avatar>

          <Typography variant='h5' className={classes.title}>Party Settings</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent className={classes.content}>
        {party && (
          <EditableText
            label='Party Name'
            disabled={!party.subscribed}
            value={party.displayName}
            onUpdate={(displayName) => client.partyManager.setPartyProperty(party.publicKey, { displayName })}
          />
        )}

        <div className={classes.divider} />

        <MenuList>
          <MenuItem
            button onClick={onVisibilityToggle}
          >
            <ListItemIcon>
              {deletedItemsVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </ListItemIcon>
            <ListItemText primary={deletedItemsVisible ? 'Hide deleted' : 'Show deleted'} />
          </MenuItem>

          <MenuItem
            button onClick={() => {
              onUnsubscribe();
              onClose();
            }}
          >
            <ListItemIcon>
              <UnsubscribeIcon />
            </ListItemIcon>
            <ListItemText primary='Unsubscribe' />
          </MenuItem>
        </MenuList>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartySettingsDialog;
