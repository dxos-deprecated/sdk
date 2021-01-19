//
// Copyright 2020 DXOS.org
//

import React, { ReactNode, useEffect, useState } from 'react';

import { Client, ClientConfig } from '@dxos/client';
import { OpenProgress } from '@dxos/echo-db';
import { ClientProvider } from '@dxos/react-client';
import { ErrorBoundary, ErrorView } from '@dxos/react-ux';

import { InitializeLoader } from '../components';

export interface ClientInitializerProps {
  config?: ClientConfig
  children?: ReactNode,
  /**
   * @deprecated
   */
  preInitialize?: (client: Client) => Promise<void> | void,
  loader?: React.ComponentType<{ progress: OpenProgress }>
}

/**
 * ClientInitializer - Provides Client initialization abstraction with error handling
 * @param preInitialize - Callback for any pre-initialization logic required for client before initializing it, e.g. model registration.
 */
// TODO(burdon): Bad abstraction -- hides client construction. Replace with ErrorWrapper.
// TODO(rzadp): removing preInitialize is blocked on:
// ISSUE: https://github.com/dxos/echo/issues/329
export const ClientInitializer = ({ config, children, preInitialize, loader }: ClientInitializerProps) => {
  const [client] = useState(() => new Client(config));
  const [clientReady, setClientReady] = useState(false);
  const [error, setError] = useState<undefined | Error | string>(undefined);
  const [progress, setProgress] = useState<OpenProgress>({ haloOpened: false });

  useEffect(() => {
    (async () => {
      await preInitialize?.(client);
      try {
        await client.initialize(setProgress);
        setClientReady(true);
      } catch (ex) {
        // It's important to print the error to the console here so sentry can report it.
        console.error(ex);
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

  const Loader = loader ?? InitializeLoader;

  return (
    <ErrorBoundary
      config={config}
      // It's important to print the error to the console here so sentry can report it.
      onError={console.error}
      onRestart={handleRestart}
      onReset={handleReset}
    >
      <ClientProvider client={client}>
        {clientReady ? children : (
          Loader && <Loader progress={progress} />
        )}
      </ClientProvider>
    </ErrorBoundary>
  );
};

export default ClientInitializer;
