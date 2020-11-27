//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import Box from '@material-ui/core/Box';

import { RegistrationDialog } from '../src';

export default {
  title: 'Identity'
};

export const withRegistration = () => {
  const [open, setOpen] = useState(true);

  const handleFinishCreate = (username, seedPhrase) => {
    console.log(username, seedPhrase);
    setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  return (
    <Box m={2}>
      <RegistrationDialog
        open={open}
        onFinishCreate={handleFinishCreate}
        onFinishRestore={() => console.warn('Not implemented in this storybook')}
        keyringDecrypter={() => console.warn('Not implemented in this storybook')}
      />
    </Box>
  );
};
