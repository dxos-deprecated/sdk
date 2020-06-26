//
// Copyright 2020 DXOS.
//

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

import ClientStory from './ClientStory';

storiesOf('HOC', module)

  // https://github.com/storybooks/storybook/tree/master/addons/knobs
  .addDecorator(withKnobs)

  // https://storybook.js.org/docs/configurations/options-parameter
  .addParameters({
    options: {
      showPanel: false,
      panelPosition: 'right'
    }
  })

  .add('Client', () => {
    return <ClientStory />;
  });
