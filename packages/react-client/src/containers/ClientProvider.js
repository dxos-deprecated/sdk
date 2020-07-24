//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useState } from 'react';

import { logs } from '@dxos/debug';
import metrics from '@dxos/metrics';

import { ClientContext } from '../hooks/context';

const { error } = logs('react-client:ClientProvider');

/**
 * Client provider container.
 */
const ClientProvider = ({ client, config = {}, children }) => {
  const [clientReady, setClientReady] = useState(false);
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (mounted) {
        try {
          await client.initialize();

          // Console access.
          if (config.devtools) {
            window.__DXOS__ = { client, metrics };
          }

          setClientReady(true);
        } catch (err) {
          error(err);
          setInitError(err);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {(clientReady || initError) && (
        <ClientContext.Provider value={{ config, client, reset: () => client.reset(), initError }}>
          {children}
        </ClientContext.Provider>
      )}
    </>
  );
};

export default ClientProvider;
