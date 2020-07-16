//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { keyToString } from '@dxos/crypto';

import { useClient } from '@dxos/react-client';

import PartyCard from '../components/PartyCard';
import { useAppRouter, usePads, useViews } from '../hooks';

const PartyCardContainer = ({ party }) => {
  const client = useClient();
  const router = useAppRouter();
  const [pads] = usePads();
  const topic = keyToString(party.publicKey);
  const { model, createView } = useViews(topic);
  return (
    <PartyCard
      party={party}
      viewModel={model}
      createView={createView}
      client={client}
      router={router}
      pads={pads}
    />
  );
};

export default PartyCardContainer;
