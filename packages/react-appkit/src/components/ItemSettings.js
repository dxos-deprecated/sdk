//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

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

const ItemSettings = ({ open, onClose, onCancel, item, closingDisabled, children, icon }) => {
  const classes = useStyles();
  const [name, setName] = useState(item ? item.displayName : '');

  const handleClose = () => {
    if (closingDisabled) {
      return;
    }

    onClose({ name });
  };

  return (
    <Dialog classes={{ paper: classes.root }} open={open} maxWidth='md' onClose={onCancel}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          {icon}
          <Typography variant='h5' className={classes.title}>Settings</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        <EditableText
          fullWidth
          label='Name'
          variant='outlined'
          value={name}
          className={classes.margin}
          onUpdate={value => setName(value)}
        />

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

export default ItemSettings;
