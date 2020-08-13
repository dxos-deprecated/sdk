//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

import { FullScreen, Passcode } from '@dxos/react-ux';

const useStyles = makeStyles(theme => ({
  comment: {
    minWidth: 360,
    paddingBottom: theme.spacing(2)
  },

  error: {
    paddingTop: theme.spacing(2)
  }
}));

/**
 * Displays the invitation challenge.
 * @param {boolean} isOfflineKeyInvitation - Whether this is a "known" invitation flow, where there is no need for pin code
 */
const AuthenticatorDialog = ({ error, onSubmit, onCancel, isOfflineKeyInvitation = false }) => {
  const classes = useStyles();

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setAttempt(attempt + 1);
  }, [error]);

  const handleSubmit = (value) => {
    console.log(`Passcode: ${value} [${attempt}]`);
    onSubmit(Buffer.from(value));
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <FullScreen>
      <Dialog open>
        <DialogTitle>
          {isOfflineKeyInvitation ? 'Authentication' : 'Authenticate'}
        </DialogTitle>

        <DialogContent>
          {isOfflineKeyInvitation ? (
            <>
              <Typography className={classes.comment}>Please wait until the authentication process is completed.</Typography>
              {!error && <LinearProgress />}
            </>
          ) : (
            <>
              <Typography className={classes.comment}>Enter the passcode.</Typography>

              <Passcode
                editable
                attempt={attempt}
                onSubmit={handleSubmit}
              />
            </>
          )}

          {error && (
            <Typography color='error' className={classes.error}>{error}</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            size='large'
            color='primary'
            test-role='code-canel'
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </FullScreen>
  );
};

export default AuthenticatorDialog;
