//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import LinkIcon from '@material-ui/icons/Link';

import { Passcode } from '@dxos/react-ux';
import Dialog from '@material-ui/core/Dialog';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 500
  },

  paper: {
    minWidth: 500
  },

  secret: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },

  link: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },

  input: {
    display: 'flex',
    flex: 1,
    marginRight: theme.spacing(2)
  }
}));

const InvitationDialog = ({ link, title, message, passcode, anchorEl, open, onClose }) => {
  const classes = useStyles();

  if (anchorEl) {
    return (
      <Popover
        anchorEl={() => anchorEl}
        open={!!anchorEl}
        onClose={() => onClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <InvitationContent link={link} title={title} message={message} passcode={passcode} />
      </Popover>
    );
  }

  if (open) {
    return (
      <Dialog open={open} onClose={onClose} classes={{ paper: classes.paper }}>
        <InvitationContent link={link} title={title} message={message} passcode={passcode} />
      </Dialog>
    );
  }

  return null;
};

const InvitationContent = ({ link, title, message, passcode }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {message && (
          <DialogContentText>{message}</DialogContentText>
        )}

        <div className={classes.secret}>
          <Passcode value={passcode} />
        </div>

        <div className={classes.link}>
          <TextField className={classes.input} value={link || ''} disabled />

          <CopyToClipboard text={link} onCopy={value => console.log(value)}>
            <IconButton
              color='inherit'
              aria-label='copy to clipboard'
              title='Copy to clipboard'
              edge='start'
            >
              <LinkIcon />
            </IconButton>
          </CopyToClipboard>
        </div>
      </DialogContent>
    </div>
  );
};

export default InvitationDialog;
