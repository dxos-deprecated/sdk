//
// Copyright 2020 DXOS.org
//

import React from 'react';

import { createKeyPair, keyToString } from '@dxos/crypto';

import { MemberAvatar } from '../src/components';

export default {
  title: 'Components'
};

export const withMemberAvatar = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: 'Test name'
  };

  return (
    <div>
      <MemberAvatar member={member} />
    </div>
  );
};

export const withNoDisplayName = () => {
  const member = {
    publicKey: keyToString(createKeyPair().publicKey),
    displayName: undefined
  };

  return (
    <div>
      <MemberAvatar member={member} />
    </div>
  );
};
