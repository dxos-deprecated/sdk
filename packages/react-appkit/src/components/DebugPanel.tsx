//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import clsx from 'clsx';
import React, { useEffect, useState, useCallback, useRef } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

// import metrics from '@dxos/metrics';
import { useConfig, useProfile } from '@dxos/react-client';
import { JsonTreeView } from '@dxos/react-ux';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden'
  },

  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'hidden'
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: theme.spacing(1)
  },

  config: {
  },

  scroll: {
    overflowX: 'hidden',
    overflowY: 'scroll'
  },

  events: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridColumnGap: 8,
    gridTemplateRows: 'repeat(auto-fit, 20px)',
    minHeight: 200
  },

  eventTime: {
    textAlign: 'right'
  },

  eventKey: {
    color: 'darkgray'
  }
}));

const getConfig = (config: Record<string, any>, key = '') => {
  let value;

  try {
    value = key.split('.').filter(Boolean).reduce((parent, key) => {
      const child = parent[key];
      return child;
    }, config);
  } catch (error) {
    // noop
  }

  return value;
};

const updateConfig = (configObject: Record<string, any>, keys: string[] = [], value: string) => {
  if (keys.length === 0) {
    return value;
  }

  const currentKey = keys[0];
  configObject[currentKey] = updateConfig(configObject[currentKey] || {}, [...keys.slice(1)], value);

  return configObject;
};

const canEditKey = (config = {}, key = '') => {
  const loop = (config = {}, keys: string[] = []): boolean => {
    if (!config || keys.length === 0) {
      return false;
    }

    const firstKey = keys.shift();
    const editableConfig = getConfig(config, firstKey);

    if (typeof editableConfig === 'boolean') {
      return editableConfig;
    }

    return loop(editableConfig, keys);
  };

  return loop(config, ['editable', ...(key.split('.').filter(Boolean))]);
};

// /**
//  * @param {*} obj
//  */
// function deepClone(obj) {
//   if (Array.isArray(obj)) {
//     return obj.map(deepClone);
//   } if (typeof obj === 'object' && obj != null) {
//     const res = {};
//     for (const key of Object.getOwnPropertyNames(obj)) {
//       res[key] = deepClone(obj[key]);
//     }
//     return res;
//   }
//   return obj;

// }

// TODO(burdon): Debug extension.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Extending_the_developer_tools
// https://developer.mozilla.org/en-US/docs/Tools/Browser_Console

const DebugPanel = () => {
  const editConfigInput = useRef(null);
  const classes = useStyles();
  const config = useConfig();
  const profile = useProfile();
  assert(profile);
  // const [values, setValues] = useState(metrics.value);
  // const [events, setEvents] = useState(metrics.events);
  const [editConfigOpen, setEditConfigOpen] = useState(false);
  const [editConfigKey, setEditConfigKey] = useState<string>();
  const [editConfigValue, setEditConfigValue] = useState();
  const [visibleConfig, setVisibleConfig] = useState<Record<string, any>>(config);

  useEffect(() => {
    setVisibleConfig({
      profile: {
        username: profile.username,
        id: profile.publicKey.toHex()
      },
      ...config,
      editable: undefined
    });

    // return metrics.on(null, () => {
    //   /**
    //    * setTimeout is used here to prevent calling setState in the render method of another component.
    //    * Since events propagate through metrics synchronously reporting an event using onFirstRender hook
    //    * will cause this callback to be fired in the same event-loop tick. React reports suspicious calls to
    //    * setState in the render method of another component as errors.
    //    */
    //   setTimeout(() => {
    //     setValues(deepClone(metrics.values));
    //     setEvents(deepClone(metrics.events));
    //   });
    // });
  }, [config]);

  const handleConfigEntryClick = useCallback((event, key) => {
    if (!canEditKey(config, key)) {
      return;
    }

    const value = getConfig(config, key);

    if (typeof value === 'object') {
      return;
    }

    setEditConfigKey(key);
    setEditConfigValue(value);
    setEditConfigOpen(true);
  }, []);

  const handleEditConfigClose = useCallback(() => {
    setEditConfigOpen(false);
  }, []);

  const handleEditConfigSave = useCallback(() => {
    assert(editConfigInput.current);
    let newValue: string | undefined = (editConfigInput.current as unknown as HTMLInputElement).value.trim();
    newValue = newValue.length === 0 ? undefined : newValue;
    const currentValue = getConfig(config, editConfigKey);
    const currentConfig = JSON.parse(localStorage.getItem('options') || '{}');

    if (newValue === currentValue) {
      return handleEditConfigClose();
    }

    assert(editConfigKey);
    const keys = editConfigKey.split('.').filter(Boolean);

    assert(newValue);
    const newConfig = updateConfig(currentConfig, keys, newValue);

    localStorage.setItem('options', JSON.stringify(newConfig));

    window.location.reload();

    handleEditConfigClose();
  }, [editConfigKey]);

  const editConfigKeyLabel = editConfigOpen && editConfigKey && editConfigKey.split('.').filter(Boolean).join(' > ');

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleEditConfigSave();
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* <div className={classes.section}>
          <Typography variant="h5">Metrics</Typography>
          <div className={classes.scroll}>
            <JsonTreeView size="small" data={values} depth={4} />
          </div>
        </div> */}

        {/* <div style={{ 'borderTop': '1px solid #EEE' }} /> */}

        {/* <div className={classes.section}>
          <Typography variant="h5">Events</Typography>
          <div className={classes.scroll}>
            <div className={classes.events}>
              {events.map((event, idx) => (
                <Fragment key={idx}>
                  <span className={classes.eventTime}>{event.time} ms</span>
                  <span className={classes.eventKey}>{event.key}</span>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 'borderTop': '1px solid #EEE' }} /> */}

        <div className={clsx(classes.section, classes.config)}>
          <Typography variant='h5'>Config</Typography>
          <div className={classes.scroll}>
            <JsonTreeView size='small' data={visibleConfig} depth={3} onSelect={handleConfigEntryClick} />
          </div>
        </div>
      </div>

      <Dialog
        fullWidth
        maxWidth='sm'
        open={editConfigOpen}
        onClose={handleEditConfigClose}
        aria-labelledby='config-dialog-title'
      >
        <DialogTitle id='config-dialog-title'>Update Local Config</DialogTitle>
        <DialogContent>
          <TextField
            label={editConfigKeyLabel}
            defaultValue={editConfigValue}
            helperText='App will be reloaded on new value.'
            variant='outlined'
            autoFocus
            margin='dense'
            type='text'
            fullWidth
            inputRef={editConfigInput}
            onKeyDown={handleKeyDown}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditConfigClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleEditConfigSave} variant='contained' color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DebugPanel;
