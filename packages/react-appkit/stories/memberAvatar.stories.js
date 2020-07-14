//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { Theme } from '../src';
import { createKeyPair, keyToString } from '@dxos/crypto';

import MemberAvatar from '../src/components/MemberAvatar';

export default {
  title: 'Member Avatar'
};

export const withMemberAvatar = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: 'Test name'
  };

  return (
    <Theme>
      <MemberAvatar member={member} />
    </Theme>
  );
};

export const withNoDisplayName = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: undefined
  };

  return (
    <Theme>
      <MemberAvatar member={member} />
    </Theme>
  );
};
