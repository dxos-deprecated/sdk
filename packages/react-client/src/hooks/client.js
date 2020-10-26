//
// Copyright 2020 DXOS.org
//

import React, { useContext } from 'react';
import getDisplayName from 'react-display-name';

import { raise } from '../util';
import { ClientContext } from './context';

/**
 * @deprecated Use `client.reset()`
 */
export const useReset = () => {
  console.warn('useReset is deprecated, use `client.reset()`');
  const { reset } = useContext(ClientContext) ?? raise(new Error('`useReset` hook is called outside of ClientContext. Wrap the component with `ClientProvider` or `ClientInitializer`'));
  return reset ? reset.reset : reset;
};

export const useClient = () => {
  const { client } = useContext(ClientContext) ?? raise(new Error('`useClient` hook is called outside of ClientContext. Wrap the component with `ClientProvider` or `ClientInitializer`'));
  return client;
};

/**
 * @deprecated
 */
export const useInitError = () => {
  console.warn('useInitError is deprecated');
  const { initError } = useContext(ClientContext) ?? raise(new Error('`useInitError` hook is called outside of ClientContext. Wrap the component with `ClientProvider` or `ClientInitializer`'));
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
