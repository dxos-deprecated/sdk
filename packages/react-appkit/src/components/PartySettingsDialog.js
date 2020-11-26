//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Check from '@material-ui/icons/CheckCircleOutline';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import Alert from '@material-ui/lab/Alert';

import { EditableText } from '@dxos/react-ux';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: '400px'
  },
  title: {
    marginLeft: theme.spacing(2)
  },
  form: {
    marginTop: theme.spacing(3)
  },
  exportedCid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(3)
  }
}));

const PartySettingsDialog = ({ open, onClose, properties = {}, onExport, displayName: initialDisplayName }) => {
  const classes = useStyles();
  const [subscribed] = useState(properties.subscribed);
  const [showDeleted, setShowDeleted] = useState(properties.showDeleted);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState(undefined);
  const [exportedCid, setExportedCid] = useState(undefined);
  const [copiedSnackBarOpen, setCopiedSnackBarOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName);

  const handleClose = () => {
    onClose({ subscribed, showDeleted, displayName });
  };

  const handleExportToIPFS = async () => {
    setInProgress(true);
    setError(undefined);
    setExportedCid(undefined);

    try {
      const cid = await onExport(true);
      setExportedCid(cid);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setInProgress(false);
    }
  };

  return (
    <Dialog classes={{ paper: classes.root }} open={open} onClose={handleClose}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          <SettingsIcon />
          <Typography variant='h5' className={classes.title}>Settings</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        <EditableText
          label='Name'
          value={displayName}
          onUpdate={setDisplayName}
        />

        {/* TODO(burdon): Implement state and handlers. */}
        <FormControl className={classes.form}>
          <FormGroup>
            {/* Not implemented for the new echo */}
            {/* <FormControlLabel
              control={
                <Checkbox
                  checked={subscribed}
                  value={subscribed}
                  onChange={() => setSubscribed(!subscribed)}
                />
              }
              label='Active'
            /> */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={showDeleted}
                  value={showDeleted}
                  onChange={() => setShowDeleted(!showDeleted)}
                />
              }
              label='Show deleted items'
            />
          </FormGroup>
        </FormControl>

        {inProgress && <LinearProgress />}
        {!!error && <Typography variant='body2' color='error'>Export unsuccessful</Typography>}
        {!!exportedCid && (
          <div className={classes.exportedCid}>
            <Check htmlColor='green' />
            <Typography variant='body1' color='primary'>
              Successfully Exported
            </Typography>
            <CopyToClipboard
              text={exportedCid}
              onCopy={() => setCopiedSnackBarOpen(true)}
            >
              <Button
                color='primary'
                variant='contained'
                size='small'
              >
                <CopyIcon />&nbsp;Copy CID
              </Button>
            </CopyToClipboard>
          </div>
        )}
      </DialogContent>

      <Snackbar
        open={copiedSnackBarOpen}
        onClose={() => setCopiedSnackBarOpen(false)}
        autoHideDuration={3000}
      >
        <Alert onClose={() => setCopiedSnackBarOpen(false)} severity='success' icon={<CopyIcon fontSize='inherit' />}>
          CID copied
        </Alert>
      </Snackbar>

      <DialogActions>
        {onExport && (
          <>
            <Button onClick={handleExportToIPFS} color='secondary' disabled={inProgress}>
              Export to IPFS
            </Button>
            <Button onClick={() => onExport(false)} color='secondary' disabled={inProgress}>
              Export to file
            </Button>
          </>
        )}

        <Button onClick={handleClose} color='primary'>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartySettingsDialog;
