//
// Copyright 2020 DXOS.org
//

import React, { ReactNode, useEffect, useState } from 'react';

import { Client, ClientConfig } from '@dxos/client';
import { ClientProvider } from '@dxos/react-client';
import { ErrorBoundary, ErrorView } from '@dxos/react-ux';

export interface ClientInitializerProps {
  config?: ClientConfig
  children?: ReactNode
}

export const ClientInitializer = ({ config, children }: ClientInitializerProps) => {
  const [client] = useState(() => new Client(config));
  const [clientReady, setClientReady] = useState(false);
  const [error, setError] = useState<undefined | Error | string>(undefined);

  useEffect(() => {
    (async () => {
      try {
        await client.initialize();
        setClientReady(true);
      } catch (ex) {
        setError(ex);
      }
    })();
  }, []);

  const handleRestart = () => {
    window.location.reload();
  };

  const handleReset = async () => {
    await client.reset();
    handleRestart();
  };

  if (error) {
    return <ErrorView onRestart={handleRestart} onReset={handleReset} error={error} />;
  }

  return (
    <ErrorBoundary
      config={config}
      onError={console.error}
      onRestart={handleRestart}
      onReset={handleReset}
    >
      <ClientProvider client={client}>
        {clientReady ? children : null}
      </ClientProvider>
    </ErrorBoundary>
  );
};

export default ClientInitializer;
