//
// Copyright 2020 DXOS.
//

import React, { useEffect, useReducer } from 'react';
import defaultsDeep from 'lodash.defaultsdeep';

import { useReset, useConfig } from '@dxos/react-client';
import { ErrorBoundary } from '@dxos/react-ux';

import errorsReducer, { SET_ERRORS } from '../hooks/errors';
import filterReducer, { SET_FILTER } from '../hooks/filter';
import layoutReducer, { SET_LAYOUT } from '../hooks/layout';

import { AppKitContext, DefaultRouter } from '../hooks';

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
const appReducer = (state, action) => ({
  // TODO(burdon): Key shouldn't be same as action type.
  [SET_ERRORS]: errorsReducer(state[SET_ERRORS], action),
  [SET_FILTER]: filterReducer(state[SET_FILTER], action),
  [SET_LAYOUT]: layoutReducer(state[SET_LAYOUT], action)
});

/**
 * Creates the AppKit framework context, which provides the global UX state.
 * Wraps children with a React ErrorBoundary component, which catches runtime errors and enables reset.
 *
 * @param {function} children
 * @param {Object} [initialState]
 * @param {Object} [router]
 * @param {function} [errorHandler]
 * @param {Array} [pads]
 * @returns {function}
 */
const AppKitContextProvider = ({ children, initialState, router = DefaultRouter, errorHandler, pads = [] }) => {
  const [state, dispatch] = useReducer(appReducer, defaultsDeep({}, initialState, defaultState));
  const reset = useReset();
  const config = useConfig();

  const { errors: { exceptions = [] } = {} } = state[SET_ERRORS] || {};

  const handleRestart = () => {
    window.location.assign(config.app.publicUrl || '/');
  };

  const handleReset = async () => {
    await reset();
    handleRestart();
  };

  const handleError = (...args) => console.error(...args);

  // Bind the error handler.
  useEffect(() => {
    if (!errorHandler) {
      return;
    }
    errorHandler.on('error', error => {
      dispatch({
        type: SET_ERRORS,
        payload: {
          exceptions: [error, ...exceptions]
        }
      });
    });
  }, []);

  return (
    <AppKitContext.Provider value={{ state, dispatch, router, pads }}>
      <ErrorBoundary onError={handleError} onRestart={handleRestart} onReset={handleReset}>
        {children}
      </ErrorBoundary>
    </AppKitContext.Provider>
  );
};

export default AppKitContextProvider;
