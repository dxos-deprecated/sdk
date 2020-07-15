//
// Copyright 2020 DXOS.org
//

import React from 'react';

import Box from '@material-ui/core/Box';

import { createKeyPair, keyToString } from '@dxos/crypto';

import { MemberAvatar, useAssets } from '../src/components';

export default {
  title: 'Components'
};

export const withMemberAvatar = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: 'Test name'
  };

  return (
    <Box m={2}>
      <MemberAvatar member={member} />
    </Box>
  );
};

export const withNoDisplayName = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: undefined
  };

  return (
    <Box m={2}>
      <MemberAvatar member={member} />
    </Box>
  );
};

export const withImages = () => {
  const assets = useAssets();

  return (
    <Box m={2}>
      <img src={assets.getThumbnail(keyToString(createKeyPair().publicKey))} />
    </Box>
  );
};
