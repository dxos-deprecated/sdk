//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { AppKitContext } from './context';

export const SET_FILTER = 'filter';

export const useFilterReducer = () => {
  const { state, dispatch } = useContext(AppKitContext);
  return [
    state[SET_FILTER] || {},
    value => dispatch({ type: SET_FILTER, payload: value })
  ];
};

export default (state = { type: '' }, action) => {
  switch (action.type) {
    case SET_FILTER:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};
