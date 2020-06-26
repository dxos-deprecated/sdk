//
// Copyright 2020 Wireline, Inc.
//

import React from 'react';
import { storiesOf } from '@storybook/react';

import TestContainer from './TestContainer';

storiesOf('Test', module)
  .add('Test', () => (
    <TestContainer />
  ));
