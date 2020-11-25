//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { useClient, useParties } from '@dxos/react-client';

export const NoPartyComponent = () => {
  const client = useClient();
  const parties = useParties();

  const keys = client.keyring.keys;

  return (
    <Box m={2}>
      <p>Create and select a party using the knobs.</p>
      <h2>Keys</h2>
      {keys.map(key => (
        <div key={key.publicKey.toString()}>{key.publicKey.toString()}</div>
      ))}
      <h2>Parties</h2>
      {parties.map(party => {
        const publicKey = party.key.toString();
        return (<div key={publicKey}>{publicKey}</div>);
      })}
    </Box>
  );
};

export default NoPartyComponent;
