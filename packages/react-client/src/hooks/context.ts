//
// Copyright 2020 DXOS.org
//

import { createContext } from 'react';

import { Client, ClientConfig } from '@dxos/client';

export interface ClientContextValue {
  client: Client,
  config: ClientConfig,
  reset?: () => {},
}

/**
 * https://reactjs.org/docs/context.html#reactcreatecontext
 * @type {React.Context}
 */
export const ClientContext = createContext<Client | undefined>(undefined);
