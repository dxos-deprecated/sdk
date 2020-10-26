//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const ErrorView = ({ onRestart, onReset, error }) => {
  if (!error) return null;

  return (
    <Dialog
      open
      onClose={onRestart}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle id='alert-dialog-title'>
        Runtime Error
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description' style={{ whiteSpace: 'pre', fontFamily: 'monospace' }}>
          {error?.stack ?? String(error)}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onRestart} variant='contained' color='primary'>
          Restart
        </Button>
        {/* TODO(burdon): Add "Are you sure?" dialog. */}
        {onReset && (
          <Button onClick={onReset} variant='contained' color='secondary'>
            Reset
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ErrorView;
