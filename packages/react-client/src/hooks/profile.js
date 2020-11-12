//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import getDisplayName from 'react-display-name';

import { useClient } from './client';

export const useProfile = () => {
  const client = useClient();
  const [profile] = useState(client.getProfile());

  // TODO(burdon): Fix.
  // useEffect(() => onEvent(
  //   client.partyManager.identityManager, 'update', () => setProfile(client.getProfile())
  // ), [client]);

  return profile;
};

// TODO(burdon): Remove HOCs.
export const withProfile = WrappedComponent => {
  const Component = props => {
    const profile = useProfile();

    return <WrappedComponent {...props} profile={profile} />;
  };

  Component.displayName = `withProfile(${getDisplayName(WrappedComponent)})`;
  return Component;
};
