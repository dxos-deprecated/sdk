//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  paper: {
    minWidth: 500
  }
}));

/**
 * Dialog to export keyring to file.
 */
const ExportKeyringDialog = ({
  open,
  topic,
  encrypter,
  onClose
}: {
  open: boolean,
  topic: string,
  encrypter: (passphrase: string) => string,
  onClose: () => void
}) => {
  const classes = useStyles();
  const [error, setError] = useState<string>();

  let passphrase = '';
  const handleChange = (event: React.SyntheticEvent) => {
    passphrase = (event.target as HTMLTextAreaElement).value.trim();
  };

  const handleExport = async () => {
    const minLength = 8;
    if (passphrase.length < minLength) {
      setError(`The passphrase must have more than ${minLength} characters.`);
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
        <Button variant='contained' color='primary' onClick={handleExport}>Export</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportKeyringDialog;
