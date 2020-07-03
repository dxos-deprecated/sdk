//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { AppKitContext } from './context';

export const SET_LAYOUT = 'layout';

export const useLayoutReducer = () => {
  const { state, dispatch } = useContext(AppKitContext);
  return [
    state[SET_LAYOUT] || {},
    value => dispatch({ type: SET_LAYOUT, payload: value })
  ];
};

export default (state, action) => {
  switch (action.type) {
    case SET_LAYOUT:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};
