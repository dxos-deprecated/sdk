//
// Copyright 2020 DXOS.org
//

import React, { Fragment, useCallback, useState } from 'react';

import { makeStyles } from '@material-ui/core';
import MuiAppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import ProfileIcon from '@material-ui/icons/AccountCircle';
import DevicesIcon from '@material-ui/icons/Devices';
import HomeIcon from '@material-ui/icons/Home';
import MenuIcon from '@material-ui/icons/Menu';
import MoreIcon from '@material-ui/icons/MoreVert';
import PersonIcon from '@material-ui/icons/Person';
import ShareIcon from '@material-ui/icons/Share';

import { BotFactoryClient } from '@dxos/botkit-client';
import { generatePasscode } from '@dxos/credentials';
import { encrypt, keyToBuffer, verify, SIGNATURE_LENGTH } from '@dxos/crypto';
import { useClient, useConfig, useProfile } from '@dxos/react-client';

import BotDialog from '../components/BotDialog';
import ExportKeyringDialog from '../components/ExportKeyringDialog';
import InvitationDialog from '../components/InvitationDialog';
import { useActionHandler, useAppRouter } from '../hooks';

// TODO(telackey): This file is dead code, and these types no longer exist.
const InviteDetails = () => null;
const InviteType = null;

const ACTION_USER_INVITATION = 1;
const ACTION_DEVICE_INVITATION = 2;
const ACTION_BOT_INVITATION = 3;
const ACTION_EXPORT_KEYRING = 4;
const ACTION_RESET_STORAGE = 6;
const ACTION_OPEN_SETTINGS = 7;
const ACTION_OPEN_PARTY_HOME = 8;
const ACTION_PARTY_FROM_FILE = 9;
const ACTION_PARTY_FROM_IPFS = 10;
const ACTION_OPEN_REDEEM = 11;
const ACTION_PARTIES_SETTINGS = 12;

const useStyles = makeStyles(theme => ({
  logo: {
    color: 'inherit'
  },

  title: {
    marginRight: theme.spacing(8)
  },

  content: {
    display: 'flex',
    flex: 1
  }
}));

/**
 * App header.
 */
const AppBar = ({
  topic,
  children,
  onToggleNav,
  onSettingsOpened,
  onHomeNavigation,
  onPartyHomeNavigation,
  onPartyFromFile,
  onPartyFromIpfs,
  onRedeemOpen,
  onPartiesSettingsOpen
}) => {
  const classes = useStyles();
  const client = useClient();
  const config = useConfig();
  const profile = useProfile();
  const router = useAppRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAction = useActionHandler();

  const [{ dialog, target } = {}, setDialog] = useState();
  const [invitation, setInvitation] = useState(null);
  const [passcode, setPasscode] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);

  const handleMenuClick = useCallback(event => {
    setMenuTarget(event.target);
  });

  const handleMenuClose = useCallback(() => {
    setMenuTarget();
  });

  const handleMenuItemClick = useCallback(handler => () => {
    handler();
    handleMenuClose();
  });

  const handleClose = () => setDialog();

  /**
   * Initiate the bot invitation flow.
   */
  const handleBotInvite = async (botFactoryTopic, spec) => {
    const { botId, ...rest } = spec;
    const botFactoryClient = new BotFactoryClient(client.networkManager, botFactoryTopic);

    const secretProvider = () => null;

    // Provided by inviter node.
    const secretValidator = async (invitation, secret) => {
      const signature = secret.slice(0, SIGNATURE_LENGTH);
      const message = secret.slice(SIGNATURE_LENGTH);
      return verify(message, signature, keyToBuffer(botFactoryTopic));
    };

    const invitation = await client.partyManager.inviteToParty(
      keyToBuffer(topic),
      new InviteDetails(InviteType.INTERACTIVE, {
        secretValidator,
        secretProvider
      }),
      {
        onFinish: () => {
          botFactoryClient.close();
          setDialog();
        }
      }
    );

    // TODO(burdon): Review function signature (e.g., rest before invitation? OK to remove botId?)
    await botFactoryClient.sendSpawnRequest(botId, topic, rest, invitation.toQueryParameters());
  };

  /**
   * Initiate the user invitation flow.
   */
  const handleUserInvite = async ({ target }) => {
    if (topic) {
      // TODO(burdon): Factor out.
      const partyKey = keyToBuffer(topic);
      const invitation = await client.partyManager.inviteToParty(
        partyKey,
        new InviteDetails(InviteType.INTERACTIVE, {
          secretValidator: (invitation, secret) => secret && secret.equals(invitation.secret),
          secretProvider: () => {
            const passcode = generatePasscode();
            setPasscode(passcode);
            return Buffer.from(passcode);
          }
        }),
        {
          onFinish: () => setDialog()
        }
      );

      setInvitation(invitation);
      setPasscode(null);
    }

    setDialog({ dialog: ACTION_USER_INVITATION, target });
  };

  /**
   * Initiate the device invitation flow.
   */
  const handleDeviceInvite = async () => {
    const secretValidator = (invitation, secret) => secret && secret.equals(invitation.secret);
    const secretProvider = () => {
      const passcode = generatePasscode();
      setPasscode(passcode);
      return Buffer.from(passcode);
    };
    const onFinish = () => setDialog();

    // TODO(rzadp): Uncomment after updating ECHO.
    // const invitation = await client.createHaloInvitation({ secretProvider, secretValidator }, { onFinish });
    const invitation = await client.echo._identityManager.halo.invitationManager.createInvitation({ secretProvider, secretValidator }, { onFinish });

    setInvitation(invitation);
    setPasscode(null);

    setDialog({ dialog: ACTION_DEVICE_INVITATION });
  };

  const keyringEncrypter = passphrase => {
    return encrypt(client.echo.keyring.toJSON(), passphrase);
  };

  //
  // Actions
  //

  const actions = {
    [ACTION_USER_INVITATION]: {
      Icon: ShareIcon,
      handler: handleUserInvite
    },

    [ACTION_DEVICE_INVITATION]: {
      label: 'Authorize device',
      handler: handleDeviceInvite
    },

    [ACTION_BOT_INVITATION]: {
      label: 'Invite bot',
      handler: () => {
        setDialog({ dialog: ACTION_BOT_INVITATION });
      }
    },

    [ACTION_EXPORT_KEYRING]: {
      label: 'Export keys',
      handler: () => {
        setDialog({ dialog: ACTION_EXPORT_KEYRING });
      }
    },

    [ACTION_RESET_STORAGE]: {
      label: 'Reset storage',
      handler: async () => {
        localStorage.clear();
        await client.reset();
        window.location.reload();
      }
    },

    [ACTION_OPEN_SETTINGS]: {
      label: 'Settings',
      handler: async () => {
        onSettingsOpened && onSettingsOpened();
      }
    },

    [ACTION_OPEN_PARTY_HOME]: {
      label: 'Party Homepage',
      handler: async () => {
        onPartyHomeNavigation && onPartyHomeNavigation();
      }
    },

    [ACTION_PARTY_FROM_FILE]: {
      label: 'Party from file',
      handler: async () => {
        onPartyFromFile && onPartyFromFile();
      }
    },

    [ACTION_PARTY_FROM_IPFS]: {
      label: 'Party from IPFS',
      handler: async () => {
        onPartyFromIpfs && onPartyFromIpfs();
      }
    },

    [ACTION_OPEN_REDEEM]: {
      label: 'Redeem invitation',
      handler: async () => {
        onRedeemOpen && onRedeemOpen();
      }
    },

    [ACTION_PARTIES_SETTINGS]: {
      label: 'Parties settings',
      handler: async () => {
        onPartiesSettingsOpen && onPartiesSettingsOpen();
      }
    }
  };

  const action = key => ({ key, ...actions[key] });

  //
  // Buttons
  //

  const buttons = [];

  //
  // Menu items
  // Disabled as not yet implemented for the new ECHO/HALO
  //

  const menuItems = [
    action(ACTION_DEVICE_INVITATION)
  ];

  // menuItems.push(action(ACTION_EXPORT_KEYRING)); // ISSUE: https://github.com/dxos/echo/issues/339#issuecomment-735918728

  if (onSettingsOpened) {
    menuItems.push(action(ACTION_OPEN_SETTINGS));
  }

  // if (onPartyHomeNavigation) {
  //   menuItems.push(action(ACTION_OPEN_PARTY_HOME));
  // }

  if (onPartyFromFile) {
    menuItems.push(action(ACTION_PARTY_FROM_FILE));
  }

  // if (onPartyFromIpfs) {
  //   menuItems.push(action(ACTION_PARTY_FROM_IPFS));
  // }

  if (onRedeemOpen) {
    menuItems.push(action(ACTION_OPEN_REDEEM));
  }

  if (onPartiesSettingsOpen) {
    menuItems.push(action(ACTION_PARTIES_SETTINGS));
  }

  menuItems.push(action(ACTION_RESET_STORAGE)); // Use devtools https://github.com/dxos/devtools

  //
  // Dialogs
  //

  const dialogs = [
    {
      key: ACTION_USER_INVITATION,
      dialog: (
        <InvitationDialog
          anchorEl={dialog === ACTION_USER_INVITATION && target}
          topic={topic}
          link={invitation && router.createInvitationUrl(invitation)}
          passcode={passcode}
          title='Invitation User'
          Icon={PersonIcon}
          message={passcode ? 'The peer has connected.' : 'A passcode will be generated once the remote peer connects.'}
          onClose={handleClose}
        />
      )
    },
    {
      key: ACTION_DEVICE_INVITATION,
      dialog: (
        <InvitationDialog
          open={dialog === ACTION_DEVICE_INVITATION}
          link={invitation && router.createInvitationUrl(invitation)}
          passcode={passcode}
          title='Authorize Device'
          Icon={DevicesIcon}
          message={passcode ? 'The peer has connected.' : 'A passcode will be generated once the remote peer connects.'}
          onClose={handleClose}
        />
      )
    },
    {
      key: ACTION_BOT_INVITATION,
      dialog: (
        <BotDialog
          open={dialog === ACTION_BOT_INVITATION}
          onSubmit={({ topic: botFactoryTopic, spec }) => handleBotInvite(botFactoryTopic, spec)}
          onClose={handleClose}
        />
      )
    },
    {
      key: ACTION_EXPORT_KEYRING,
      dialog: (
        <ExportKeyringDialog
          open={dialog === ACTION_EXPORT_KEYRING}
          topic={topic}
          onClose={handleClose}
          encrypter={keyringEncrypter}
        />
      )
    }
  ];

  return (
    <MuiAppBar position='static'>
      <Toolbar variant='dense'>
        {onToggleNav && (
          <IconButton
            edge='start'
            color='inherit'
            aria-label='toggle sidebar'
            onClick={onToggleNav}
          >
            <MenuIcon />
          </IconButton>
        )}
        {onHomeNavigation && (
          <IconButton
            edge='start'
            color='inherit'
            aria-label='home'
            onClick={onHomeNavigation}
          >
            <HomeIcon />
          </IconButton>
        )}
        <Grid container wrap='nowrap' alignItems='center'>
          <Typography variant='h6' className={classes.title}>{config.app.name}</Typography>

          <div className={classes.content}>
            {children}
          </div>
        </Grid>

        {/* Buttons */}
        {buttons.map(({ key, Icon, handler }) => (
          <IconButton
            key={key}
            color='inherit'
            onClick={handler}
          >
            <Icon />
          </IconButton>
        ))}

        <div>
          <Tooltip title={profile.username || 'Loading...'}>
            <IconButton color='inherit'>
              <ProfileIcon />
            </IconButton>
          </Tooltip>
        </div>

        {/* Menu Button */}
        {menuItems.length > 0 && (
          <IconButton
            color='inherit'
            aria-label='More'
            aria-haspopup='true'
            onClick={handleMenuClick}
          >
            <MoreIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Menu */}
      <Menu
        open={!!menuTarget}
        anchorEl={menuTarget}
        onClose={handleMenuClose}
        disableAutoFocusItem
        PaperProps={{
          style: {
            maxHeight: 48 * 5.5,
            width: 200
          }
        }}
      >
        {menuItems.map(({ key, label, handler }) => (
          <MenuItem key={key} onClick={handleMenuItemClick(handler)}>{label}</MenuItem>
        ))}
      </Menu>

      {
        dialogs.map(({ key, dialog }) => <Fragment key={key}>{dialog}</Fragment>)
      }
    </MuiAppBar>
  );
};

export default AppBar;
