//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import React, { useState } from 'react';

import { makeStyles, Theme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import PeopleIcon from '@material-ui/icons/People';

import { IpfsHelper } from '../helpers';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minWidth: '400px'
  },
  title: {
    marginLeft: theme.spacing(2)
  },
  cidInput: {
    marginTop: theme.spacing(2)
  }
}));

const PartyFromIpfsDialog = ({
  open,
  onClose,
  onImport,
  ipfs
}: {
  open: boolean,
  onClose: () => void,
  onImport: (content: ArrayBuffer | string | null) => void,
  ipfs: IpfsHelper
}) => {
  const classes = useStyles();
  const [cid, setCid] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState(undefined);

  const handleClose = () => {
    setCid('');
    setInProgress(false);
    setError(undefined);
    onClose();
  };

  const handleImport = async () => {
    setInProgress(true);
    setError(undefined);
    try {
      assert(cid);
      const { string } = await ipfs.download(cid);
      await onImport(string);
      handleClose();
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setInProgress(false);
    }
  };

  return (
    <Dialog classes={{ paper: classes.root }} maxWidth='lg' open={open} onClose={handleClose}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          <PeopleIcon />
          <Typography variant='h5' className={classes.title}>Import Party</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        <Typography variant='body1'>A Party can be exported and imported from IPFS.</Typography>
        <TextField
          autoFocus
          fullWidth
          label='CID'
          value={cid}
          onChange={e => setCid(e.target.value)}
          className={classes.cidInput}
        />
        {!!error && <Typography variant='body2' color='error'>Import unsuccessful</Typography>}
        {inProgress && <LinearProgress />}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='secondary'>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!cid || inProgress} variant='contained' color='primary'>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartyFromIpfsDialog;
