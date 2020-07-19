//
// Copyright 2020 DXOS.org
//

import defaultsDeep from 'lodash.defaultsdeep';
import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import primary from '@material-ui/core/colors/blue';
import secondary from '@material-ui/core/colors/blueGrey';

// https://material-ui.com/customization/theming
export const defaultThemeProperties = {
  props: {
    MuiAppBar: {
      elevation: 0
    },

    MuiButtonBase: {
      disableRipple: true
    }
  },

  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          overflow: 'hidden' // Prevent scroll bounce.
        }
      }
    }
  },

  // TODO(burdon): DXOS Palette.
  palette: {
    primary,
    secondary
  }
};

export const createTheme = (base) => createMuiTheme(
  defaultsDeep(base, defaultThemeProperties)
);

// TODO(burdon): Rename ThemeProvider or Remove.
const Theme = ({ children, base }) => (
  <MuiThemeProvider theme={createTheme(base)}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
);

export default Theme;
