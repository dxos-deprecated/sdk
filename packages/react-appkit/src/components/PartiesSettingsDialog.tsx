//
// Copyright 2020 DXOS.org
//

import React from 'react';

import {
  Dialog,
  DialogTitle,
  Toolbar,
  Typography,
  Theme,
  makeStyles,
  DialogContent,
  FormControlLabel,
  Switch
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: '400px'
  },
  title: {
    marginLeft: theme.spacing(2)
  }
}));

const PartiesSettingsDialog = ({
  open,
  showInactiveParties,
  onClose,
  onToggleInactiveParties
}: {
  open: boolean,
  showInactiveParties: boolean,
  onClose: () => void,
  onToggleInactiveParties: () => void
}) => {
  const classes = useStyles();

  const handleToggleInactiveParties = () => {
    onToggleInactiveParties();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog classes={{ paper: classes.root }} maxWidth='lg' open={open} onClose={handleClose}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          <SettingsIcon />
          <Typography variant='h5' className={classes.title}>Parties settings</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        <FormControlLabel
          control={
            <Switch
              checked={showInactiveParties}
              onChange={handleToggleInactiveParties}
              color="primary"
            />
          }
          label="Show inactive parties"
        />
      </DialogContent>
    </Dialog>
  );
};

export default PartiesSettingsDialog;
