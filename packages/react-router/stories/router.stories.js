//
// Copyright 2020 DXOS.
//

import React from 'react';
import { storiesOf } from '@storybook/react';

import TestContainer from './TestContainer';

storiesOf('Test', module)
  .add('Test', () => (
    <TestContainer />
  ));
