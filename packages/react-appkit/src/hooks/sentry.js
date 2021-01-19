//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { AppKitContext } from './context';

/**
 * Sentry is used for logging tracking messages, e.g. when a user registers, performs invitation, etc.
 */
export const useSentry = () => {
  const { sentry = undefined } = useContext(AppKitContext);
  return sentry;
};
