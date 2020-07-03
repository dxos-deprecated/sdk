//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { AppKitContext } from './context';

export const SET_ERRORS = 'errors';

export const useErrorReducer = () => {
  const { state, dispatch } = useContext(AppKitContext);
  return [
    state[SET_ERRORS] || {},
    value => dispatch({ type: SET_ERRORS, payload: value || { exceptions: [] } })
  ];
};

export default (state, action) => {
  switch (action.type) {
    case SET_ERRORS:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};
