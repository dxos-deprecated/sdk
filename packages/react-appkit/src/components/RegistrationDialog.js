//
// Copyright 2020 DXOS.org
//

import React, { useRef, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import CreateIcon from '@material-ui/icons/AddCircleOutline';
import RestoreIcon from '@material-ui/icons/Restore';

import { generateSeedPhrase } from '@dxos/credentials';

const useStyles = makeStyles((theme) => ({
  paper: {
    minWidth: 700,
    minHeight: 300
  },

  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between'
  },

  choice: {
    width: 300,
    height: 240,
    margin: theme.spacing(1),
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
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  seedWord: {
    display: 'inline-block',
    backgroundColor: '#f5f5f5',
    width: 90,
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    textAlign: 'center'
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
const RegistrationDialog = ({ open = true, debug = false, onFinish }) => {
  const classes = useStyles();
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
        if (ev.shiftKey || debug ||
          (testWords.length === 2 && testWords[0] === words[selected[0]] && testWords[1] === words[selected[1]])) {
          await onFinish(username, seedPhrase);
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
          await onFinish(username, restoreSeedPhrase);
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

  const SeedPhraseTextField = ({ value }) => {
    const words = value.split(' ');
    const rows = [words.slice(0, 6), words.slice(6, 12)];

    return (
      <div className={classes.seedPhrase}>
        {rows.map((row, i) => (
          <div key={i}>
            {row.map((word, i) => (
              <Paper key={i} className={classes.seedWord}>
                <Typography key={i}>{word}</Typography>
              </Paper>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // TODO(burdon): Configure title.
  const getStage = stage => {
    // eslint-disable-next-line default-case
    switch (stage) {
      case STAGE_START: {
        return (
          <>
            <DialogTitle>User Profile</DialogTitle>
            <DialogContent className={classes.container}>
              <div>
                <Paper className={classes.choice} variant='outlined'>
                  <CreateIcon className={classes.icon} />
                  <Typography className={classes.caption}>
                    Create a new profile<br />and wallet.
                  </Typography>
                  <Button variant='contained' color='primary' onClick={() => setStage(STAGE_ENTER_USERNAME)}>
                    Create Wallet
                  </Button>
                </Paper>
              </div>
              <div>
                <Paper className={classes.choice} variant='outlined'>
                  <RestoreIcon className={classes.icon} />
                  <Typography className={classes.caption}>
                    Enter your seed phrase<br />to recover your profile.
                  </Typography>
                  <Button variant='contained' color='primary' onClick={() => setStage(STAGE_RESTORE)}>
                    Recover Wallet
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
              <Typography gutterBottom>
                Your seed phrase consists of the twelve words below.
              </Typography>
              <SeedPhraseTextField value={seedPhrase} />
              <Typography gutterBottom>
                You will need to enter the seed phrase if you ever need to recover your wallet.
                <br />
                Please write it down and keep it safe.
                <br />
                <br />
                It is <b>IMPORTANT</b> that you never share your seed phrase with anyone.
              </Typography>
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
            <DialogTitle>Verify The Seed Phrase</DialogTitle>
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
    <Dialog open={open} maxWidth='md' classes={{ paper: classes.paper }}>
      {getStage(stage)}
    </Dialog>
  );
};

export default RegistrationDialog;
