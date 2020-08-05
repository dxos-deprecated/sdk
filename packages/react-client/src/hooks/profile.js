//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';
import getDisplayName from 'react-display-name';

import { onEvent } from '@dxos/async';

import { useClient } from './client';

export const useProfile = () => {
  const client = useClient();
  const [profile, setProfile] = useState(client.getProfile());

  useEffect(() => onEvent(
    client.partyManager.identityManager,
    'update',
    () => setProfile(client.getProfile())
  ), [client]);

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
