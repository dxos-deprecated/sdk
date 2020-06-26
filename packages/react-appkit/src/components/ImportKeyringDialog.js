//
// Copyright 2019 Wireline, Inc.
//

import React, { useState, useRef } from 'react';

import { useConfig } from '@dxos/react-client';
import { reload } from '@dxos/react-router';

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
 * Dialog to import keyring from file.
 *
 * @param {boolean} open
 * @param {function} onClose
 * @param {function} decrypter
 * @constructor
 */
const ImportKeyringDialog = ({ open, onClose, decrypter }) => {
  const classes = useStyles();
  const config = useConfig();
  const buttonRef = useRef();
  const fileRef = useRef();
  const [passphrase, setPassphrase] = useState(0);

  const handlePassChange = (event) => {
    setPassphrase(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        await decrypter(event.target.result, passphrase);

        // TODO(burdon): Pass through global action handler from layout.
        reload(config.app.publicUrl);
      };

      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} classes={{ paper: classes.paper }}>
      <input
        type='file'
        id='import-keyring-file'
        style={{ display: 'none' }}
        onChange={handleFileChange}
        ref={fileRef}
      />

      <DialogTitle>Import Keys</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label='Passphrase'
          onChange={handlePassChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color='primary'
          ref={buttonRef}
          disabled={!passphrase}
          onClick={async () => fileRef.current.click()}
        >
          Choose File
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportKeyringDialog;
