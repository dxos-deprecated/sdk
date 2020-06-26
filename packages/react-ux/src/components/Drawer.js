//
// Copyright 2020 DXOS.
//

import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

const DRAWER_WIDTH = 300;

const useStyles = makeStyles(theme => {
  return {
    root: {
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      overflow: 'hidden'
    },

    drawer: {
      width: 0,
      transition: `width ${theme.transitions.duration.enteringScreen}ms ${theme.transitions.easing.easeOut} 0ms`
    },

    drawerOpen: ({ width }) => ({
      width,
      transition: `width ${theme.transitions.duration.leavingScreen}ms ${theme.transitions.easing.sharp} 0ms`
    }),

    drawerPaper: () => ({
      position: 'inherit'
    }),

    content: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1
    }
  };
});

const DrawerBase = ({ open, position, component, width = DRAWER_WIDTH, children }) => {
  const classes = useStyles({ width, open });

  const left = position === 'left';
  const right = position === 'right';

  const content = (
    <div className={classes.content}>
      {children}
    </div>
  );

  const drawer = (
    <Drawer
      className={clsx(
        classes.drawer,
        {
          [classes.drawerOpen]: open
        }
      )}
      classes={{ paper: classes.drawerPaper }}
      open={open}
      anchor={position}
      variant='persistent'
    >
      {component}
    </Drawer>
  );

  return (
    <div className={classes.root}>
      {left && drawer}
      {content}
      {right && drawer}
    </div>
  );
};

/**
 * Left-side drawer.
 */
export const LeftDrawer = (props) => {
  return (
    <DrawerBase
      {...props}
      position='left'
    />
  );
};

/**
 * Right-side drawer.
 */
export const RightDrawer = (props) => {
  return (
    <DrawerBase
      {...props}
      position='right'
    />
  );
};
