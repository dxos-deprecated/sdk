//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState, useCallback } from 'react';
import getDisplayName from 'react-display-name';

import { onEvent } from '@dxos/async';
import { keyToString } from '@dxos/crypto';

import { useClient } from './client';

export const useProfile = () => {
  const client = useClient();

  const getProfileData = useCallback(() => {
    const { identityManager: idm } = client.partyManager;

    if (!idm || !idm.publicKey) return;

    const publicKey = keyToString(idm.publicKey);

    return {
      username: idm.displayName || publicKey,
      publicKey
    };
  }, [client]);

  const [profile, setProfile] = useState(getProfileData());

  useEffect(() => onEvent(
    client.partyManager.identityManager,
    'update',
    () => setProfile(getProfileData())
  ), [client, getProfileData]);

  return profile;
};

export const withProfile = WrappedComponent => {
  const Component = props => {
    const profile = useProfile();

    return <WrappedComponent {...props} profile={profile} />;
  };

  Component.displayName = `withProfile(${getDisplayName(WrappedComponent)})`;
  return Component;
};
