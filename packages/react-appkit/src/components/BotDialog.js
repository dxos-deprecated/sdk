//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import { useRegistryBots, useRegistryBotFactories } from '@dxos/react-client';

// TODO(egorgripasov): Factor out to config/client.
const BOT_FACTORY_DOMAIN = 'dxos.network';

const useStyles = makeStyles((theme) => ({
  paper: {
    // TODO(burdon): Standardize.
    minWidth: 500
  },
  formControl: {
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  errorMessage: {
    color: red[300]
  },
  advanced: {
    border: 0,
    boxShadow: 'none',
    '&:before': {
      display: 'none'
    }
  },
  advancedHeader: {
    padding: 0
  },
  advancedBody: {
    display: 'block'
  }
}));

/**
 * Dialog to create and invite bot to party.
 *
 * @param open
 * @param onSubmit
 * @param onClose
 */
const BotDialog = ({ open, onSubmit, onClose }) => {
  const classes = useStyles();
  const [pending, setPending] = useState(false);
  const [bot, setBot] = useState('');
  const [botFactoryTopic, setBotFactoryTopic] = useState('');
  const [botVersions, setBotVersions] = useState([]);
  const [botVersion, setBotVersion] = useState();
  const [error, setError] = useState();
  const [advanced, setAdvanced] = useState(false);

  // TODO(burdon): Could have same topic?
  const registryBotFactories = useRegistryBotFactories();
  const registryBots = useRegistryBots();

  const handleSubmit = async () => {
    setError(undefined);
    setPending(true);
    try {
      await onSubmit({ topic: botFactoryTopic, bot: botVersion });
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const versions = registryBots
      .filter(({ names }) => !!names.find(name => name.startsWith(`${bot}@`)))
      .map(({ names }) => names).flat()
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).reverse()
      .filter(name => name !== bot);

    versions.unshift(bot);
    setBotVersions(versions);
    setBotVersion(bot || '');
  }, [bot]);

  useEffect(() => {
    if (Array.isArray(registryBotFactories)) {
      const botFactory = registryBotFactories.find(({ name }) => name === window.location.hostname) ||
        registryBotFactories.find(({ name }) => name?.endsWith(BOT_FACTORY_DOMAIN));
      if (botFactory) {
        setBotFactoryTopic(botFactory.topic);
        setAdvanced(false);
      } else {
        setAdvanced(true);
      }
    }
  }, [registryBotFactories]);

  const handleClose = () => {
    setError(undefined);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : handleClose} // No click away when in progress
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>Invite Bot</DialogTitle>

      <DialogContent>
        <FormControl className={classes.formControl}>
          <InputLabel id='botNameLabel'>Bot</InputLabel>
          <Select
            labelId='botNameLabel'
            id='botName'
            value={bot}
            fullWidth
            disabled={pending}
            onChange={event => setBot(event.target.value)}
          >
            {registryBots
              .filter(bots => bots.names && bots.names.length)
              .map(({ names = [] }) => names.sort((a, b) => a.length - b.length).filter(name => name.indexOf('@') === -1))
              .filter(names => names.length)
              .map(names => (
                <MenuItem key={names[0]} value={names[0]}>
                  {names[0]}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Accordion
          className={classes.advanced}
          expanded={advanced}
          onChange={() => setAdvanced(!advanced)}
        >
          <AccordionSummary
            className={classes.advancedHeader}
            expandIcon={<ArrowDropDownIcon />}
          >
            <InputLabel shrink>Advanced</InputLabel>
          </AccordionSummary>
          <AccordionDetails className={classes.advancedBody}>
            <FormControl className={classes.formControl}>
              <InputLabel id='botVersionLabel'>Version</InputLabel>
              <Select
                labelId='botVersionLabel'
                id='botVersion'
                value={botVersion}
                disabled={botVersions.length === 0 || pending}
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

            <FormControl className={classes.formControl}>
              <InputLabel id='botFactoryLabel'>Bot Factory</InputLabel>
              <Select
                labelId='botFactoryLabel'
                id='botFactory'
                value={botFactoryTopic}
                fullWidth
                disabled={pending}
                onChange={event => setBotFactoryTopic(event.target.value)}
              >
                {registryBotFactories
                  .filter(factories => factories.names && factories.names.length)
                  .map(({ topic, names }) => (
                    <MenuItem key={topic} value={topic}>
                      {names[0]}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
        {pending && (<LinearProgress />)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={pending || !botFactoryTopic || !botVersion}
          color='primary'
          onClick={handleSubmit}
        >
          Invite
        </Button>
      </DialogActions>
      {error && (
        <DialogActions>
          <Typography variant='body1' className={classes.errorMessage}>
            Deploying failed. Please try again later.
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BotDialog;
