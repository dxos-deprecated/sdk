//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';

import { EditableText } from '@dxos/react-ux';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 400
  },
  title: {
    marginLeft: theme.spacing(2)
  },
  margin: {
    marginBottom: theme.spacing(2)
  }
}));

// TODO(burdon): Remove itemModel (pass in item and callbacks).
const ItemSettingsDialog = ({
  open,
  onClose,
  itemModel,
  itemId,
  closingDisabled,
  children
}: {
  open: boolean,
  onClose: () => void,
  itemModel: any,
  itemId: string,
  closingDisabled: boolean,
  children: React.ReactNode
}) => {
  const classes = useStyles();

  // TODO(burdon): Pass in item (this doesn't need to know about all items).
  const item = itemModel.getById(itemId);

  const handleClose = () => {
    if (closingDisabled) {
      return;
    }

    onClose();
  };

  const handleEnterKey = (value: string) => {
    itemModel.renameItem(itemId, value);
    handleClose();
  };

  return (
    <Dialog classes={{ paper: classes.root }} open={open} maxWidth='md' onClose={handleClose}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          {/* TODO(burdon): Show pad-specific icon */}
          <SettingsIcon />
          <Typography variant='h5' className={classes.title}>Settings</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        {/* TODO(burdon): When would there not be an item??? */}
        {item && (
          <EditableText
            fullWidth
            label='Name'
            variant='outlined'
            value={item.displayName}
            autoFocus={true}
            className={classes.margin}
            onUpdate={(value: string) => itemModel.renameItem(itemId, value)}
            onEnterKey={(value: string) => handleEnterKey(value)}
          />
        )}

        {/* Custom content. */}
        <div className={classes.margin}>
          {children}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='primary' disabled={closingDisabled}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemSettingsDialog;
