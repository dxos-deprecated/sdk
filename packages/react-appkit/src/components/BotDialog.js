//
// Copyright 2020 DXOS.
//

import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  paper: {
    minWidth: 500,

    '& .MuiTextField-root': {
      marginBottom: theme.spacing(2)
    }
  }
}));

// TODO(burdon): Query registry.
const DEFAULT_SPEC = {
  botId: 'wrn:bot:wireline.io/store#1.0.0'
};

/**
 * Dialog to create and invite bot to party.
 *
 * @param open
 * @param onSubmit
 * @param onClose
 * @constructor
 */
const BotDialog = ({ open, onSubmit, onClose }) => {
  const classes = useStyles();

  const [topic, setTopic] = useState('');
  const [disabled, setDisabled] = useState(false);

  // TODO(burdon): Form editor.
  const [spec, setSpec] = useState(JSON.stringify(DEFAULT_SPEC));

  return (
    <Dialog open={open} onClose={onClose} onExit={() => setDisabled(false)} classes={{ paper: classes.paper }}>
      <DialogTitle>Invite Bot</DialogTitle>

      <DialogContent>
        <TextField
          label='Topic'
          autoFocus
          fullWidth
          value={topic}
          onChange={event => setTopic(event.target.value)}
          style={{ paddinBottom: 16 }}
        />

        <TextField
          label='Spec'
          fullWidth
          multiline
          spellCheck={false}
          value={spec}
          onChange={event => setSpec(event.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={disabled}
          color='primary'
          onClick={() => {
            try {
              onSubmit({
                topic,
                spec: JSON.parse(spec)
              });

              setDisabled(true);
            } catch (err) {
              // TODO(burdon): Show JSON parse error.
            }
          }}
        >
          {disabled ? 'Sending...' : 'Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BotDialog;
