//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { storiesOf } from '@storybook/react';

import Dialog from '@material-ui/core/Dialog';

import { FullScreen } from '@dxos/react-ux';

import RegistrationDialog from '../src/components/RegistrationDialog';

storiesOf('components', module)
  .add('RegistrationPanel', () => (
    <FullScreen>
      <Dialog open>
        <RegistrationDialog open onFinish={() => {}} />
      </Dialog>
    </FullScreen>
  ));
