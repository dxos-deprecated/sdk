//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(() => ({
  paper: {
    minWidth: 500
  }
}));

/**
 * Dialog to export keyring to file.
 *
 * @param {boolean} open
 * @param {function} encrypter
 * @param {string} topic
 * @param {function} onClose
 * @constructor
 */
const ExportKeyringDialog = ({ open, topic, encrypter, onClose }) => {
  const classes = useStyles();
  const [error, setError] = useState();

  let passphrase = '';

  const handleChange = (event) => {
    passphrase = event.target.value.trim();
  };

  const handleExport = async () => {
    if (passphrase.length < 8) {
      setError('Passphrase must have than 8 characters.');
      return;
    }

    const encrypted = encrypter(passphrase);
    const file = new Blob([encrypted], { type: 'text/plain' });

    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `${topic}.keyring`;
    element.click();

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} classes={{ paper: classes.paper }}>
      <DialogTitle>Export Keys</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          error={!!error}
          helperText={error}
          label='Passphrase'
          onChange={handleChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='primary' onClick={handleExport}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportKeyringDialog;
