//
// Copyright 2020 DXOS.org
//

import React, { useContext } from 'react';
import getDisplayName from 'react-display-name';

import { ClientContext } from './context';

export const useConfig = () => {
  const { config } = useContext(ClientContext);
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
