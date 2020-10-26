//
// Copyright 2020 DXOS.org
//

import React, { ReactNode, useEffect, useReducer, useState } from 'react';
import defaultsDeep from 'lodash.defaultsdeep';

import { useReset, useConfig, ClientProvider } from '@dxos/react-client';
import { ErrorBoundary, ErrorView } from '@dxos/react-ux';

import errorsReducer, { SET_ERRORS } from '../hooks/errors';
import filterReducer, { SET_FILTER } from '../hooks/filter';
import layoutReducer, { SET_LAYOUT } from '../hooks/layout';

import { AppKitContext, DefaultRouter } from '../hooks';
import { Client, ClientConfig } from '@dxos/client';

const defaultState = {
  [SET_LAYOUT]: {
    showSidebar: true,
    showDebug: false
  }
};

/**
 * Actions reducer.
 * https://reactjs.org/docs/hooks-reference.html#usereducer
 * @param {Object} state
 * @param {string} action
 */
const appReducer = (state: any, action: any) => ({
  // TODO(burdon): Key shouldn't be same as action type.
  [SET_ERRORS]: errorsReducer(state[SET_ERRORS], action),
  [SET_FILTER]: filterReducer(state[SET_FILTER], action),
  [SET_LAYOUT]: layoutReducer(state[SET_LAYOUT], action)
});

export interface AppKitConfig extends ClientConfig {
  app?: {
    name?: string,
    rootElement?: string,
    publicUrl?: string,
  }
}

export interface AppKitContextProviderProps {
  config?: AppKitConfig,
  children?: ReactNode,
  initialState?: {
    [SET_ERRORS]?: any,
    [SET_FILTER]?: any,
    [SET_LAYOUT]?: any,
  },
  pads?: any[],
  errorHandler?: any,
  issuesLink?: string,
  router?: any,
}

/**
 * Creates the AppKit framework context, which provides the global UX state.
 * Wraps children with a React ErrorBoundary component, which catches runtime errors and enables reset.
 */
const AppKitContextProvider = ({ config, children, initialState, router = DefaultRouter, errorHandler, pads = [], issuesLink = undefined }: AppKitContextProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, defaultsDeep({}, initialState, defaultState));
  const [client] = useState(() => new Client(config));
  const [clientReady, setClientReady] = useState(false);
  const [error, setError] = useState<undefined | Error | string>(undefined);

  const { errors: { exceptions = [] } = {} } = state[SET_ERRORS] || {};

  const handleRestart = () => {
    window.location.assign(config?.app?.publicUrl || '/');
  };

  const handleReset = async () => {
    await client.reset();
    handleRestart();
  };

  const handleError = (...args: any[]) => console.error(...args);

  useEffect(() => {
    (async () => {
      try {
        await client.initialize();
        setClientReady(true);
      } catch(e) {
        setError(e)
      }
    })()
  }, [])

  // Bind the error handler.
  useEffect(() => {
    if (!errorHandler) {
      return;
    }
    errorHandler.on('error', (error: any) => {
      dispatch({
        type: SET_ERRORS,
        payload: {
          exceptions: [error, ...exceptions]
        }
      });
    });
  }, []);

  if (error) {
    return <ErrorView onRestart={handleRestart} onReset={handleReset} error={error} />;
  }

  return (
    <AppKitContext.Provider value={{ state, dispatch, router, pads, issuesLink, client }}>
      <ErrorBoundary onError={handleError} onRestart={handleRestart} onReset={handleReset}>
        <ClientProvider client={client}>
          {clientReady && children}
        </ClientProvider>
      </ErrorBoundary>
    </AppKitContext.Provider>
  );
};

export default AppKitContextProvider;
