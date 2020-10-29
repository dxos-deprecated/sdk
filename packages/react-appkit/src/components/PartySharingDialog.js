//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { useTheme } from '@material-ui/styles';
import { makeStyles, withStyles } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import DeleteIcon from '@material-ui/icons/Clear';
import FaceIcon from '@material-ui/icons/Face';
import LinkIcon from '@material-ui/icons/Link';
import PeopleIcon from '@material-ui/icons/People';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { humanize } from '@dxos/crypto';
import { useInvitation } from '@dxos/react-client';

import MemberAvatar, { getAvatarStyle } from './MemberAvatar';
import BotDialog from './BotDialog';
import { useMembers } from '../hooks';

const useStyles = makeStyles(theme => ({
  title: {
    marginLeft: theme.spacing(2)
  },
  table: {
    minWidth: 650,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  tableContainer: {
    maxHeight: 250,
    paddingRight: 20
  },
  expand: {
    display: 'flex',
    flex: 1
  },
  label: {
    fontVariant: 'all-small-caps'
  },
  passcode: {
    marginLeft: theme.spacing(1),
    padding: theme.spacing(1),
    border: `2px solid ${theme.palette.primary.dark}`
  },
  colAvatar: {
    width: 60
  },
  colPasscode: {
    width: 160
  },
  colStatus: {
    width: 100
  },
  colActions: {
    width: 60,
    textAlign: 'right'
  }
}));

const TableCell = withStyles(theme => ({
  root: {
    borderBottom: 'none',
    padding: 0,
    paddingBottom: theme.spacing(0.5)
  }
}))(MuiTableCell);

function PendingInvitation ({ party, pending, handleCopy, onInvitationDone }) {
  const classes = useStyles();
  const [inviteCode, pin] = useInvitation(party.key, { onDone: () => onInvitationDone(pending.id) });

  return (
    <TableRow>
      <TableCell classes={{ root: classes.colAvatar }}>
        <Avatar style={getAvatarStyle(useTheme())}>
          <FaceIcon />
        </Avatar>
      </TableCell>
      <TableCell />
      <TableCell classes={{ root: classes.colPasscode }}>
        {pin && (
          <>
            <span className={classes.label}>Passcode</span>
            <span className={classes.passcode}>{pin}</span>
          </>
        )}
      </TableCell>
      <TableCell classes={{ root: classes.colStatus }}>
        <span className={classes.label}>{pending.done ? 'Done' : 'Pending'}</span>
      </TableCell>
      <TableCell classes={{ root: classes.colActions }}>
        {pin ? null : (
          <>
            <CopyToClipboard
              text={inviteCode}
              onCopy={handleCopy}
            >
              <IconButton
                size='small'
                color='inherit'
                aria-label='copy to clipboard'
                title='Copy to clipboard'
                edge='start'
              >
                <LinkIcon />
              </IconButton>
            </CopyToClipboard>
          </>)}
      </TableCell>
    </TableRow>
  );
}

const PartySharingDialog = ({ party, open, onClose, client, router }) => {
  const classes = useStyles();
  const [invitations, setInvitations] = useState([]);
  const [botDialogVisible, setBotDialogVisible] = useState(false);
  const [copiedSnackBarOpen, setCopiedSnackBarOpen] = useState(false);

  const members = useMembers(party);

  const createInvitation = () => setInvitations([{ id: Date.now() }, ...invitations]);

  const handleBotInvite = () => console.warn('Bot invitation not yet ported to the new echo');

  const handleCopy = (value) => {
    setCopiedSnackBarOpen(true);
    console.log(value);
  };

  const handleInvitationDone = (invitationId) => {
    setInvitations(old => ([
      ...old.filter(invite => invite.id !== invitationId),
      ...old.filter(invite => invite.id === invitationId).map(invite => ({ ...invite, done: true }))
    ]));
  };

  // TODO(burdon): Columns in EACH section should have same content:
  // [SMALL AVATAR] [NAME] [INVITATION PIN] [MEMBER TYPE] [ACTIONS: e.g., refresh PIN/remove]

  return (
    <Dialog open={open} maxWidth='md' onClose={onClose}>
      <DialogTitle>
        <Toolbar variant='dense' disableGutters>
          <PeopleIcon />
          <Typography variant='h5' className={classes.title}>Share with People and Bots</Typography>
        </Toolbar>
      </DialogTitle>

      <DialogContent>
        <Toolbar variant='dense' disableGutters>
          <div>
            <Button
              size='small'
              onClick={createInvitation}
            >
              Invite User
            </Button>
            <Button
              size='small'
              onClick={() => setBotDialogVisible(true)}
              disabled
            >
              Invite Bot
            </Button>
          </div>
        </Toolbar>

        <BotDialog
          open={botDialogVisible}
          onSubmit={async ({ topic: bfTopic, bot, spec }) => handleBotInvite(bfTopic, bot, spec)}
          onClose={() => setBotDialogVisible(false)}
        />

        <Snackbar
          open={copiedSnackBarOpen}
          onClose={() => setCopiedSnackBarOpen(false)}
          autoHideDuration={3000}
        >
          <Alert onClose={() => setCopiedSnackBarOpen(false)} severity='success' icon={<FileCopyIcon fontSize='inherit' />}>
            Invite code copied
          </Alert>
        </Snackbar>

        <TableContainer className={classes.tableContainer}>
          <Table className={classes.table} size='small' padding='none' aria-label='contacts'>
            <TableBody>
              {invitations.map((pending) => <PendingInvitation key={pending.id} party={party} pending={pending} handleCopy={handleCopy} onInvitationDone={handleInvitationDone} />)}
            </TableBody>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.publicKey}>
                  <TableCell classes={{ root: classes.colAvatar }}>
                    <MemberAvatar member={member} />
                  </TableCell>
                  <TableCell>
                    {member.displayName || humanize(member.publicKey)}
                  </TableCell>
                  <TableCell />
                  <TableCell classes={{ root: classes.colStatus }}>
                    <span className={classes.label}>{member.displayName?.startsWith('bot:') ? 'Bot' : 'Member'}</span>
                  </TableCell>
                  <TableCell classes={{ root: classes.colActions }}>
                    <IconButton size='small'>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartySharingDialog;
