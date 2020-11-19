//
// Copyright 2020 DXOS.org
//

import React, { useContext } from 'react';
import getDisplayName from 'react-display-name';

import { raise } from '../util';
import { ClientContext } from './context';

export const useConfig = () => {
  const { config } = useContext(ClientContext) ?? raise(new Error('`useConfig` hook is called outside of ClientContext. Wrap the component with `ClientProvider` or `ClientInitializer`'));
  return config;
};

export const withConfig = WrappedComponent => {
  const Component = props => {
    const config = useConfig();

    return <WrappedComponent {...props} config={config} />;
  };

  Component.displayName = `withConfig(${getDisplayName(WrappedComponent)})`;
  return Component;
};
