//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { FullScreen, Passcode } from '@dxos/react-ux';

import { useIssuesLink } from '../hooks';

const useStyles = makeStyles(theme => ({
  comment: {
    minWidth: 360,
    paddingBottom: theme.spacing(2)
  },

  error: {
    paddingTop: theme.spacing(2)
  },

  summary: {
    outline: 'none',
    userSelect: 'none'
  },

  code: {
    display: 'block',
    font: 'monospace',
    padding: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#eee',
    borderRadius: '8px',
    margin: '8px',
    overflow: 'scroll'
  }
}));

/**
 * Displays the invitation challenge.
 * @param {boolean} isOfflineKeyInvitation - Whether this is a "known" invitation flow, where there is no need for pin code
 */
const AuthenticatorDialog = ({ error, onSubmit, onCancel, isOfflineKeyInvitation = false, recognisedError = undefined }) => {
  const classes = useStyles();
  const [issuesLink] = useIssuesLink();

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (error) {
      console.error(`Authentication failed: ${error}`);
    }
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
              <Typography className={classes.comment}>Processing...</Typography>
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
            <>
              <Typography color='error' className={classes.error}>{recognisedError || 'System error.'}</Typography>
              <br />
              <details>
                <summary className={classes.summary}>Details</summary>
                <div>
                  <Typography color='error' className={classes.code}>{error}</Typography>
                  {issuesLink && (
                    <Link
                      color='primary'
                      href={issuesLink}
                      target='_blank'
                      rel='noopener'
                    >
                      Please submit an issue.
                    </Link>
                  )}
                </div>
              </details>
            </>
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
