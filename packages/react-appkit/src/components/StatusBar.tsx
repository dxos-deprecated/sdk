//
// Copyright 2020 DXOS.org
//

import clsx from 'clsx';
import React from 'react';

import { SvgIconTypeMap } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import grey from '@material-ui/core/colors/grey';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },

  statusBar: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: grey[800],
    minHeight: 32
  },

  button: {
    padding: theme.spacing(1),
    color: grey[300]
  },

  icon: {
    marginLeft: theme.spacing(2),
    color: grey[300]
  },

  active: {
    color: theme.palette.primary.dark
  },

  meta: {
    color: grey[200]
  }
}));

/**
 * Status bar.
 */
const StatusBar = (
  props: {
    actions: {
      Icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>,
      handler: () => void,
      isActive: () => boolean,
      title: string
    }[],
    indicators: {
      Icon: OverridableComponent<SvgIconTypeMap<unknown, 'svg'>>,
      isActive: () => boolean,
    }[],
    meta: string,
    errors: string[],
    onResetErrors: () => void
  }) => {
  const { actions = [], indicators = [], meta, errors = [], onResetErrors } = props;
  const classes = useStyles();

  return (
    <footer className={classes.root}>
      <Toolbar variant='dense' className={classes.statusBar}>
        <div>
          {
            actions.map(({ Icon, handler, isActive, title }, i) => (
              <IconButton key={i} onClick={handler} className={classes.button} title={title}>
                <Icon fontSize='small' className={clsx({ [classes.active]: isActive && isActive() })} />
              </IconButton>
            ))
          }
        </div>

        {meta && (
          <Typography className={classes.meta}>{meta}</Typography>
        )}

        <div>
          {
            indicators.map(({ Icon, isActive }, i) => (
              <Icon
                key={i}
                fontSize='small'
                className={clsx(classes.icon, { [classes.active]: isActive && isActive() })}
              />
            ))
          }
        </div>
      </Toolbar>

      {/* TODO(burdon): Multiple snackbars: https://github.com/iamhosseindhv/notistack */}
      {errors.length > 0 && (
        <Snackbar
          key={String(errors[0])}
          open={Boolean(errors)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          TransitionComponent={Slide}
        >
          <Alert severity='error' variant='filled' onClose={onResetErrors}>{String(errors[0])}</Alert>
        </Snackbar>
      )}
    </footer>
  );
};

export default StatusBar;
