//
// Copyright 2020 DXOS.org
//

import React, { ReactNode, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import DevicesIcon from '@material-ui/icons/Devices';
import Alert from '@material-ui/lab/Alert';

import { InvitationDescriptor } from '@dxos/echo-db';
import { useAuthenticator } from '@dxos/react-client';
import { createPath, useQuery } from '@dxos/react-router';
import { FullScreen } from '@dxos/react-ux';

import DialogHeading from '../components/DialogHeading';
import { useAppRouter } from '../hooks';

const useStyles = makeStyles(theme => ({
  marginTop: {
    marginTop: theme.spacing(2)
  }
}));

const TitledDialog = ({ children }: {children?: ReactNode}) => {
  return (
    <FullScreen>
      <Dialog open>
        <DialogHeading title='Authenticate Device' icon={DevicesIcon}/>
        {children}
      </Dialog>
    </FullScreen>
  );
};

/**
 * Handles inbound invitation URL.
 */
const DeviceAuthenticator = () => {
  const classes = useStyles();
  const history = useHistory();
  const invitation = InvitationDescriptor.fromQueryParameters(useQuery() as any);
  // const client = useClient();
  const appRouter = useAppRouter();
  const [pinCode, setPinCode] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // TODO(burdon): Provide status of remote connection (e.g., show sender key; don't display PIN until connected).
  const [{ topic, identity, error }, setSecret] = useAuthenticator(invitation as any);
  if (topic) {
    appRouter.push({ topic });
  } else if (identity) {
    history.push(createPath());
  }

  const handleSubmit = async () => {
    if (inProgress || cancelling) {
      return;
    }
    setInProgress(true);
    setSecret(Buffer.from(pinCode));
  };

  const handleCancel = async () => {
    setCancelling(true);
    // await client.reset(); // ISSUE: https://github.com/dxos/echo/issues/331
    window.location.replace(createPath());
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  const recognisedError = error &&
    error.includes('ERR_GREET_INVALID_INVITATION') &&
    'The invitation does not exist or the attempted access to it was unauthorized.';

  if (error) {
    return (
      <TitledDialog>
        <DialogContent>
          <Alert severity="error">{recognisedError || 'System error.'}</Alert>
          <DialogActions>
            <Button autoFocus color='secondary' onClick={handleCancel}>Cancel</Button>
          </DialogActions>
        </DialogContent>
      </TitledDialog>
    );
  }

  if (inProgress) {
    return (
      <TitledDialog>
        <DialogContent>
          <LinearProgress />
          <Typography className={classes.marginTop} variant='body1' gutterBottom>
              Processing...
          </Typography>
        </DialogContent>
      </TitledDialog>
    );
  }

  return (
    <TitledDialog>
      <DialogContent>
        {cancelling ? (
          <>
            <LinearProgress />
            <Typography className={classes.marginTop} variant='body1' gutterBottom>
              Cancelling...
            </Typography>
          </>
        ) : (
          <>
            <Typography variant='body1' gutterBottom>
            Enter the PIN number.
            </Typography>
            <TextField
              value={pinCode}
              onChange={(event) => setPinCode(event.target.value)}
              onKeyDown={handleKeyDown}
              variant='outlined'
              margin='normal'
              required
              fullWidth
              label='PIN Code'
              autoFocus
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        {/* <Button color='secondary' onClick={handleCancel} disabled={inProgress || cancelling}>Cancel</Button> */}
        {/* ISSUE: https://github.com/dxos/echo/issues/331 */}
        <Button variant='contained' color='primary' onClick={handleSubmit} disabled={inProgress || cancelling}>Submit</Button>
      </DialogActions>
    </TitledDialog>
  );
};

export default DeviceAuthenticator;
