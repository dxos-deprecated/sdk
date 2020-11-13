//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { makeStyles, withStyles } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import MuiTableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InviteIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Clear';
import FaceIcon from '@material-ui/icons/Face';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import LinkIcon from '@material-ui/icons/Link';
import PeopleIcon from '@material-ui/icons/People';
import Alert from '@material-ui/lab/Alert';
import { useTheme } from '@material-ui/styles';

import { BotFactoryClient } from '@dxos/botkit-client';
import { humanize, keyToBuffer, keyToString, verify, SIGNATURE_LENGTH } from '@dxos/crypto';
import { useClient, useContacts, useInvitation, useOfflineInvitation } from '@dxos/react-client';

import { useMembers } from '../hooks';
import BotDialog from './BotDialog';
import MemberAvatar, { getAvatarStyle } from './MemberAvatar';

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
  const [inviteCode, pin] = useInvitation(party.key, {
    onDone: () => onInvitationDone(pending.id),
    onError: e => {
      throw e;
    }
  });

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

function PendingOfflineInvitation ({ party, invitation, handleCopy }) {
  const [inviteCode] = useOfflineInvitation(party.key, invitation.contact, {
    onError: e => {
      throw e;
    }
  });

  return (
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
  );
}

const PartySharingDialog = ({ party, open, onClose }) => {
  const classes = useStyles();
  const client = useClient();
  const [contactsInvitations, setContactsInvitations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [botDialogVisible, setBotDialogVisible] = useState(false);
  const [copiedSnackBarOpen, setCopiedSnackBarOpen] = useState(false);
  const topic = keyToString(party.key);

  const members = useMembers(party);
  const [contacts] = useContacts();
  const invitableContacts = contacts?.filter(c => !members.some(m => m.publicKey.toString('hex') === c.publicKey.toString('hex'))); // contacts not already in this party

  const createInvitation = () => setInvitations([{ id: Date.now() }, ...invitations]);
  const createOfflineInvitation = (contact) => setContactsInvitations(old => [...old, { id: Date.now(), contact }]);

  const handleBotInvite = async (botFactoryTopic, botId, spec = {}) => {
    const botFactoryClient = new BotFactoryClient(client.networkManager, botFactoryTopic);

    const secretProvider = () => {};

    // Provided by inviter node.
    const secretValidator = async (invitation, secret) => {
      const signature = secret.slice(0, SIGNATURE_LENGTH);
      const message = secret.slice(SIGNATURE_LENGTH);
      return verify(message, signature, keyToBuffer(botFactoryTopic));
    };

    const invitation = await party.createInvitation({ secretValidator, secretProvider });

    const botUID = await botFactoryClient.sendSpawnRequest(botId);
    await botFactoryClient.sendInvitationRequest(botUID, topic, spec, invitation.toQueryParameters());
    setBotDialogVisible(false);
  };

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
          <Typography variant='h5' className={classes.title}>Access permissions</Typography>
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
              {invitations
                .filter((invitation) => !invitation.done)
                .map((pending) => <PendingInvitation key={pending.id} party={party} pending={pending} handleCopy={handleCopy} onInvitationDone={handleInvitationDone} />)}
            </TableBody>

            {members.length > 0 && (
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
            )}

            {invitableContacts.length > 0 && (
              <TableBody>
                {invitableContacts.map(contact => (
                  <TableRow key={contact.publicKey}>
                    <TableCell classes={{ root: classes.colAvatar }}>
                      <MemberAvatar member={contact} />
                    </TableCell>
                    <TableCell>
                      {contact.displayName || humanize(contact.publicKey)}
                    </TableCell>
                    <TableCell />
                    <TableCell classes={{ root: classes.colStatus }}>
                      <span className={classes.label}>Contact</span>
                    </TableCell>
                    <TableCell classes={{ root: classes.colActions }}>
                      {contactsInvitations.find(p => p.contact === contact) === undefined ? (
                        <IconButton size='small'>
                          <InviteIcon
                            onClick={() => createOfflineInvitation(contact)}
                          />
                        </IconButton>
                      ) : (
                        <PendingOfflineInvitation
                          handleCopy={handleCopy}
                          party={party}
                          invitation={contactsInvitations.find(p => p.contact === contact)}
                          onInvitationDone={() => console.warn('not impl')}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}

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
