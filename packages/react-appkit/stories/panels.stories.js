//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import { FullScreen } from '@dxos/react-ux';

import RegistrationDialog from '../src/components/RegistrationDialog';

storiesOf('Panels', module)
  .add('RegistrationPanel', () => {
    const [open, setOpen] = useState(true);

    const handleFinish = (username, seedPhrase) => {
      console.log(username, seedPhrase);
      setOpen(false);
    };

    return (
      <FullScreen>
        <RegistrationDialog open={open} onFinish={handleFinish} />
      </FullScreen>
    );
  });
