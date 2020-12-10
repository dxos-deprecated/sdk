//
// Copyright 2020 DXOS.org
//

import defaultsDeep from 'lodash.defaultsdeep';
import React, { ReactNode, useEffect, useReducer, useState } from 'react';

import { useClient } from '@dxos/react-client';

import { AppKitContext, DefaultRouter } from '../hooks';
import errorsReducer, { SET_ERRORS } from '../hooks/errors';
import filterReducer, { SET_FILTER } from '../hooks/filter';
import layoutReducer, { SET_LAYOUT } from '../hooks/layout';

const noop = () => {}; // eslint-disable-line

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

export interface AppKitProviderProps {
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
  keywords?: string[], // Used for sorting relevant registry records first
  sentry?: any,
}

/**
 * Creates the AppKit framework context, which provides the global UX state.
 * Wraps children with a React ErrorBoundary component, which catches runtime errors and enables reset.
 */
const AppKitProvider = ({ children, initialState, router = DefaultRouter, errorHandler, pads = [], issuesLink = undefined, keywords = [], sentry = undefined }: AppKitProviderProps) => {
  const client = useClient();
  const [state, dispatch] = useReducer(appReducer, defaultsDeep({}, initialState, defaultState));
  const [padsRegistered, setPadsRegistered] = useState(false);

  const { errors: { exceptions = [] } = {} } = state[SET_ERRORS] || {};

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

  useEffect(() => {
    const registerPadModels = async () => {
      for (const pad of pads) {
        await pad.register?.(client);
      }
      setPadsRegistered(true);
    };

    registerPadModels();
  }, []);

  const profile = client.getProfile();
  if (profile !== undefined && sentry !== undefined) {
    sentry.setUser({ username: `${profile.username}-${profile.publicKey.toHex()}`, id: profile.publicKey.toHex() });
  }

  return (
    <AppKitContext.Provider value={{ state, dispatch, router, pads, issuesLink, keywords, sentry }}>
      {padsRegistered && children}
    </AppKitContext.Provider>
  );
};

export default AppKitProvider;
