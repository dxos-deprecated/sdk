//
// Copyright 2020 DXOS.org
//

import { storiesOf } from '@storybook/react';
import React from 'react';

import MuiAppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import { FullScreen } from '@dxos/react-ux';

import { Theme } from '../src';

// TODO(burdon): Cannot use Layout/AppBar without context.
storiesOf('Layout', module)
  .add('Basic layout', () => (
    <FullScreen>
      <Theme>
        <MuiAppBar position='static' elevation={0}>
          <Toolbar variant='dense'>
            <Typography variant='h5'>Test</Typography>
          </Toolbar>
        </MuiAppBar>

        <Toolbar variant='dense'>
          <Button color='primary' variant='contained'>Test</Button>
          <Button color='secondary'>Test</Button>
        </Toolbar>
      </Theme>
    </FullScreen>
  ));
