//
// Copyright 2020 DXOS.org
//

import React, { ReactNode } from 'react';
import { Client } from '@dxos/client';
import { ClientContext } from '../hooks/context';

export interface ClientProviderProps {
  client: Client
  children?: ReactNode
}

/**
 * Client provider container.
 */
export const ClientProvider = ({ client, children }: ClientProviderProps) => {
  return (
    <ClientContext.Provider value={{ config: {}, client, reset: () => client.reset() }}>
      {children}
    </ClientContext.Provider>
  );
};
