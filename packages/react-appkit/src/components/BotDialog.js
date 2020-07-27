//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputLabel, MenuItem, Select, TextField, IconButton } from '@material-ui/core';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import ListIcon from '@material-ui/icons/List';

import { useRegistryBots, useRegistryBotFactories } from '../hooks/registry';
import FormControl from '@material-ui/core/FormControl';

const useStyles = makeStyles((theme) => ({
  paper: {
    // TODO(burdon): Standardize.
    minWidth: 500
  },
  formControl: {
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  manualBotFactoryContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  }
}));

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
  const [pending, setPending] = useState(false);
  const [bot, setBot] = useState('');
  const [botFactoryTopic, setBotFactoryTopic] = useState('');
  const [botVersions, setBotVersions] = useState([]);
  const [botVersion, setBotVersion] = useState();
  const [isBotFactoryManually, setBotFactoryManually] = React.useState(false);

  // TODO(burdon): Could have same topic?
  const registryBotFactories = useRegistryBotFactories();
  const registryBots = useRegistryBots();

  useEffect(() => {
    const versions = registryBots
      .filter(({ name }) => name === bot).map(({ version }) => version)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .reverse();

    setBotVersions(versions);
    setBotVersion(versions[0] || '');
  }, [bot]);

  const BotFactoryField = () => {
    if (isBotFactoryManually) {
      return (
        <div className={classes.manualBotFactoryContainer}>
          <TextField
            id='botFactory-basic'
            label='Bot Factory'
            value={botFactoryTopic}
            onChange={event => setBotFactoryTopic(event.target.value)}
            fullWidth
          />
          <IconButton
            onClick={() => {
              setBotFactoryTopic('');
              setBotFactoryManually(false);
            }} color='primary'
          >
            <ListIcon />
          </IconButton>
        </div>
      );
    }
    return (
      <FormControl className={classes.formControl}>
        <InputLabel id='botFactoryLabel'>Bot Factory</InputLabel>
        <Select
          labelId='botFactoryLabel'
          id='botFactory'
          value={botFactoryTopic}
          fullWidth
          onChange={event => setBotFactoryTopic(event.target.value)}
        >
          {registryBotFactories
            .map(({ topic, name }) => (
              <MenuItem key={topic} value={topic}>
                {name}
              </MenuItem>
            ))}
          <MenuItem onClick={() => {
            setBotFactoryTopic('');
            setBotFactoryManually(true);
          }}
          >
            Provide manually&nbsp;<BorderColorIcon fontSize='small' />
          </MenuItem>
        </Select>
      </FormControl>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} onExit={() => setPending(false)} classes={{ paper: classes.paper }}>
      <DialogTitle>Invite Bot</DialogTitle>

      <DialogContent>
        <BotFactoryField />
        <FormControl className={classes.formControl}>
          <InputLabel id='botNameLabel'>Bot</InputLabel>
          <Select
            labelId='botNameLabel'
            id='botName'
            value={bot}
            fullWidth
            onChange={event => setBot(event.target.value)}
          >
            {registryBots
              .map(({ name }) => name)
              .filter((value, index, self) => self.indexOf(value) === index)
              .map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel id='botVersionLabel'>Version</InputLabel>
          <Select
            labelId='botVersionLabel'
            id='botVersion'
            value={botVersion}
            disabled={botVersions.length === 0}
            fullWidth
            onChange={event => setBotVersion(event.target.value)}
          >
            {botVersions.map(version => (
              <MenuItem key={version} value={version}>
                {version}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={pending}
          color='primary'
          onClick={() => {
            onSubmit({ topic: botFactoryTopic, bot, botVersion });
            setPending(true);
          }}
        >
          Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BotDialog;
