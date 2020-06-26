//
// Copyright 2018 Wireline, Inc.
//

import React, { useContext } from 'react';
import getDisplayName from 'react-display-name';

import { ClientContext } from './context';

export const useReset = () => {
  const { reset } = useContext(ClientContext);
  return reset ? reset.reset : reset;
};

export const useClient = () => {
  const { client } = useContext(ClientContext);
  return client;
};

export const useInitError = () => {
  const { initError } = useContext(ClientContext);
  return initError;
};

export const withClient = WrappedComponent => {
  const Component = props => {
    const { client } = useContext(ClientContext);

    return <WrappedComponent {...props} client={client} />;
  };

  Component.displayName = `withClient(${getDisplayName(WrappedComponent)})`;
  return Component;
};
