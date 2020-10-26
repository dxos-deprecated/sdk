import { Client, ClientConfig } from "@dxos/client";
import React, { ReactNode, useEffect, useState } from 'react';
import { ErrorBoundary, ErrorView } from '@dxos/react-ux';
import { ClientProvider } from "@dxos/react-client";

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
      } catch(e) {
        setError(e)
      }
    })()
  }, []);


  const handleRestart = () => {
    window.location.reload()
  };

  const handleReset = async () => {
    await client.reset();
    handleRestart();
  };

  if (error) {
    return <ErrorView onRestart={handleRestart} onReset={handleReset} error={error} />;
  }
  
  return (
    <ErrorBoundary onError={console.error} onRestart={handleRestart} onReset={handleReset}>
      <ClientProvider client={client}>
        {clientReady ? children : null}
      </ClientProvider>
    </ErrorBoundary>
  );
}
