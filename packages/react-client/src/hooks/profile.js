//
// Copyright 2020 DXOS.org
//

import React, { useState, useEffect } from 'react';
import getDisplayName from 'react-display-name';

import { useClient } from './client';

export const useProfile = () => {
  const client = useClient();
  const [profile, setProfile] = useState(client.getProfile());

  useEffect(() => 
    client.subscribeToProfile(() => setProfile(client.getProfile())), 
  [client]);

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
