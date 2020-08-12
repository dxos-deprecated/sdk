//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { AppKitContext } from './context';

export const usePads = () => {
  const { pads = [] } = useContext(AppKitContext);
  return [pads];
};
