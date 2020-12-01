//
// Copyright 2020 DXOS.org
//

import React, { ReactNode, useEffect } from 'react';

// import { Client } from '@dxos/client';
import metrics from '@dxos/metrics';

import { Client } from '../../../client';
import { ClientContext } from '../hooks/context';

export interface ClientProviderProps {
  client: Client
  children?: ReactNode
}

/**
 * Client provider container.
 */
export const ClientProvider = ({ client, children }: ClientProviderProps) => {
  useEffect(() => {
    (window as any).__DXOS__ = { context: client.getDevtoolsContext(), metrics };
  }, []);

  return (
    <ClientContext.Provider value={client}>
      {children}
    </ClientContext.Provider>
  );
};
