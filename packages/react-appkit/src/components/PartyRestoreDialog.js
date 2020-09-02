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
import PeopleIcon from '@material-ui/icons/People';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  title: {
    marginLeft: theme.spacing(2)
  },
  textField: {
    minWidth: 250,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4)
  }
}));

const PartyRestoreDialog = ({ open, onClose, onSubmit }) => {
  const classes = useStyles();
  const [data, setData] = useState('');
  const [error, setError] = useState(undefined);

  const handleSubmit = () => {
    try {
      onSubmit(data);
      handleClose();
    } catch (e) {
      console.error(e);
      setError(e);
    }
  };

  const handleClose = () => {
    setData('');
    setError(undefined);
    onClose();
  };

  return (
    <Dialog open={open} maxWidth='lg' onClose={handleClose}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          <PeopleIcon />
          <Typography variant='h5' className={classes.title}>Restore Party</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        <Typography variant='body1'>Restore Party contents from file:</Typography>
        <TextField
          placeholder='Paste data here'
          multiline
          value={data}
          onChange={e => setData(e.target.value)}
          rows={4}
          className={classes.textField}
        />
        {!!error && <Typography variant='body2' color='error'>Restore unsuccessful</Typography>}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='secondary'>
          Cancel
        </Button>
        <Button disabled={!data || !!error} onClick={handleSubmit} color='primary'>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartyRestoreDialog;
