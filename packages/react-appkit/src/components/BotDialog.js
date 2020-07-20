//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { useRegistryBots, useRegistryBotFactories } from '../hooks/registry';

const useStyles = makeStyles((theme) => ({
  paper: {
    minWidth: 500,

    '& .MuiTextField-root': {
      marginBottom: theme.spacing(2)
    }
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

  const [disabled, setDisabled] = useState(false);
  const [bot, setBot] = useState('');
  const [botFactoryTopic, setBotFactoryTopic] = useState('');
  const [botVersions, setBotVersions] = useState([]);
  const [botVersion, setBotVersion] = useState();

  const registryBots = useRegistryBots();
  const registryBotFactories = useRegistryBotFactories();

  useEffect(() => {
    const versions = registryBots
      .filter(({ name }) => name === bot).map(({ version }) => version)
      .sort()
      .reverse();
    setBotVersions(versions);
    setBotVersion(versions[0] || '');
  }, [bot]);

  return (
    <Dialog open={open} onClose={onClose} onExit={() => setDisabled(false)} classes={{ paper: classes.paper }}>
      <DialogTitle>Invite Bot</DialogTitle>

      <DialogContent>
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
        </Select>

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

        <InputLabel id='botVersionLabel'>Version</InputLabel>
        <Select
          labelId='botVersionLabel'
          id='botVersion'
          value={botVersion}
          fullWidth
          onChange={event => setBotVersion(event.target.value)}
        >
          {botVersions.map(version => (
            <MenuItem key={version} value={version}>
              {version}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={disabled}
          color='primary'
          onClick={() => {
            onSubmit({ topic: botFactoryTopic, bot, botVersion });
            setDisabled(true);
          }}
        >
          {disabled ? 'Sending...' : 'Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BotDialog;
