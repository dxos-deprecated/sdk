//
// Copyright 2020 DXOS.org
//

import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ContentCopyIcon from '@material-ui/icons/VpnKey';
import CreateIcon from '@material-ui/icons/AddCircleOutline';
import RestoreIcon from '@material-ui/icons/Restore';

import { generateSeedPhrase, keyPairFromSeedPhrase, KeyType } from '@dxos/credentials';
import { keyToString } from '@dxos/crypto';
import { useClient, useConfig } from '@dxos/react-client';
import { FullScreen } from '@dxos/react-ux';
import { useQuery, createUrl } from '@dxos/react-router';

const useStyles = makeStyles((theme) => ({
  paper: {
    width: 600,
    maxWidth: 600,
    minHeight: 300
  },

  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between'
  },

  choice: {
    width: 260,
    height: 240,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },

  icon: {
    margin: theme.spacing(2),
    fontSize: 'xx-large'
  },

  caption: {
    textAlign: 'center',
    marginBottom: theme.spacing(4)
  },

  seedPhrase: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

const STAGE_START = 0;
const STAGE_RESTORE = 1;
const STAGE_ENTER_USERNAME = 2;
const STAGE_SHOW_SEED_PHRASE = 3;
const STAGE_CHECK_SEED_PHRASE = 4;

// TODO(burdon): Factor out.
const ordinal = n => String(n) + ((n === 1) ? 'st' : (n === 2) ? 'nd' : (n === 3) ? 'rd' : 'th');

/**
 * Registration and recovery dialog.
 */
const Registration = () => {
  const classes = useStyles();
  const client = useClient();
  const config = useConfig();

  // TODO(burdon): Replace with router.
  // Redirect to initial URL.
  const history = useHistory();
  const { redirectUrl = '/', ...rest } = useQuery();

  const [stage, setStage] = useState(STAGE_START);
  const [seedPhrase] = useState(generateSeedPhrase());
  const [username, setUsername] = useState('');

  const words = seedPhrase.split(' ');
  const selected = [Math.floor(Math.random() * words.length), Math.floor(Math.random() * words.length)];
  while (selected[0] === selected[1]) {
    selected[1] = Math.floor(Math.random() * words.length);
  }
  selected.sort((a, b) => (a < b ? -1 : a === b ? 0 : 1));

  const usernameRef = useRef();
  const seedPhraseRef = useRef();

  const handleFinish = async (seedPhrase) => {
    // TODO(telackey): Replace with feedStore.deleteAll() once that is published in @dxos/feed-store
    // cf. https://github.com/dxos/feed-store/pull/13
    await Promise.all(client.feedStore.getDescriptors().map(({ path }) => client.feedStore.deleteDescriptor(path)));

    const identityKeyPair = keyPairFromSeedPhrase(seedPhrase);
    await client.keyring.addKeyRecord({ ...identityKeyPair, type: KeyType.IDENTITY });
    await client.partyManager.identityManager.initializeForNewIdentity({
      identityDisplayName: username || keyToString(client.partyManager.identityManager.publicKey),
      deviceDisplayName: keyToString(client.partyManager.identityManager.deviceManager.publicKey)
    });
    history.push(createUrl(redirectUrl, rest));
  };

  const handleNext = async (ev) => {
    switch (stage) {
      case STAGE_ENTER_USERNAME: {
        if (usernameRef.current.value.trim().length > 0) {
          setUsername(usernameRef.current.value.trim());
          setStage(STAGE_SHOW_SEED_PHRASE);
        }
        break;
      }

      case STAGE_SHOW_SEED_PHRASE: {
        setStage(STAGE_CHECK_SEED_PHRASE);
        break;
      }

      case STAGE_CHECK_SEED_PHRASE: {
        const testWords = seedPhraseRef.current.value.trim().toLowerCase().split(/\W+/);
        if (ev.shiftKey || config.debug.mode === 'development' ||
          (testWords.length === 2 && testWords[0] === words[selected[0]] && testWords[1] === words[selected[1]])) {
          await handleFinish(seedPhrase);
        } else {
          setStage(STAGE_SHOW_SEED_PHRASE);
        }
        break;
      }

      case STAGE_RESTORE: {
        const restoreSeedPhrase = seedPhraseRef.current.value.trim().toLowerCase();
        // sanity check it looks like a seed phrase
        if (restoreSeedPhrase.split(/\s+/g).length !== 12) {
          // TODO(burdon): Report invalid input to user.
          console.log('Bad seed phrase');
        } else {
          // TODO(dboreham): do more checks on input (not all strings containing 12 words are valid seed phrases)
          await handleFinish(restoreSeedPhrase);
        }
        break;
      }

      default:
        setStage(STAGE_ENTER_USERNAME);
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      await handleNext(event);
    }
  };

  const SeedPhraseTextField = ({ value }) => (
    <TextField
      className={classes.seedPhrase}
      type='text'
      value={value}
      variant='outlined'
      multiline
      readOnly
      fullWidth
      onFocus={event => event.target.select()}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <CopyToClipboard text={value}>
              <Tooltip title='Copy seed phrase'>
                <IconButton edge='end' aria-label='copy seed phrase'>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
          </InputAdornment>
        )
      }}
    />
  );

  const getStage = stage => {
    // eslint-disable-next-line default-case
    switch (stage) {
      case STAGE_START: {
        return (
          <>
            <DialogTitle>Welcome to DxOS</DialogTitle>
            <DialogContent className={classes.container}>
              <div>
                <Paper className={classes.choice} variant='outlined'>
                  <RestoreIcon className={classes.icon} />
                  <Typography className={classes.caption}>
                    Import your existing wallet using a 12 word seed phrase.
                  </Typography>
                  <Button variant='contained' color='primary' onClick={() => setStage(STAGE_RESTORE)}>
                    Import Wallet
                  </Button>
                </Paper>
              </div>
              <div>
                <Paper className={classes.choice} variant='outlined'>
                  <CreateIcon className={classes.icon} />
                  <Typography className={classes.caption}>
                    Create a new wallet and<br />seed phrase.
                  </Typography>
                  <Button variant='contained' color='primary' onClick={() => setStage(STAGE_ENTER_USERNAME)}>
                    Create Wallet
                  </Button>
                </Paper>
              </div>
            </DialogContent>
            <DialogActions />
          </>
        );
      }

      case STAGE_RESTORE: {
        return (
          <>
            <DialogTitle>Restoring your Wallet</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>Enter the seed phrase.</Typography>
              <TextField autoFocus fullWidth spellCheck={false} inputRef={seedPhraseRef} onKeyDown={handleKeyDown} />
            </DialogContent>
            <DialogActions>
              <Button color='primary' onClick={() => setStage(STAGE_START)}>Back</Button>
              <Button variant='contained' color='primary' onClick={handleNext}>Restore</Button>
            </DialogActions>
          </>
        );
      }

      case STAGE_ENTER_USERNAME: {
        return (
          <>
            <DialogTitle>Create your Identity</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>Enter a username.</Typography>
              <TextField autoFocus fullWidth spellCheck={false} inputRef={usernameRef} onKeyDown={handleKeyDown} />
            </DialogContent>
            <DialogActions>
              <Button color='primary' onClick={() => setStage(STAGE_START)}>Back</Button>
              <Button variant='contained' color='primary' onClick={handleNext}>Next</Button>
            </DialogActions>
          </>
        );
      }

      case STAGE_SHOW_SEED_PHRASE: {
        return (
          <>
            <DialogTitle>Seed Phrase</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>Write down your seed phrase and keep it safe.</Typography>
              <Typography gutterBottom>You will need it if you ever need to recover your wallet.</Typography>
              <SeedPhraseTextField value={seedPhrase} />
            </DialogContent>
            <DialogActions>
              <Button color='primary' onClick={() => setStage(STAGE_ENTER_USERNAME)}>Back</Button>
              <Button variant='contained' color='primary' onClick={handleNext}>Next</Button>
            </DialogActions>
          </>
        );
      }

      case STAGE_CHECK_SEED_PHRASE: {
        return (
          <>
            <DialogTitle>Verify Seed Phrase</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                {`Enter the ${ordinal(selected[0] + 1)} and ${ordinal(selected[1] + 1)} words.`}
              </Typography>
              <TextField autoFocus fullWidth spellCheck={false} inputRef={seedPhraseRef} onKeyDown={handleKeyDown} />
            </DialogContent>
            <DialogActions>
              <Button color='primary' onClick={() => setStage(STAGE_ENTER_USERNAME)}>Back</Button>
              <Button variant='contained' color='primary' onClick={handleNext}>Finish</Button>
            </DialogActions>
          </>
        );
      }
    }
  };

  return (
    <FullScreen>
      <Dialog open classes={{ paper: classes.paper }}>
        <>{getStage(stage)}</>
      </Dialog>
    </FullScreen>
  );
};

export default Registration;
