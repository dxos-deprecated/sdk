//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { PartyCard } from '../src';

export default {
  title: 'Parties'
};

export const withNewPartyCard = () => {
  return (
    <Box m={2}>
      <PartyCard onNewParty={() => null} />
    </Box>
  );
};
