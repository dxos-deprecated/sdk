//
// Copyright 2020 DXOS.org
//

import { render } from '@testing-library/react';
import React from 'react';

import Theme from '../src/components/Theme';

const themeBase = {
  // https://material-ui.com/customization/breakpoints/
  breakpoints: {
    values: {
      subMbp: 1600,
      // defaults:
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  }
};

export const renderWithTheme = (child) => render(
  <Theme base={themeBase}>
    {child}
  </Theme>
);
