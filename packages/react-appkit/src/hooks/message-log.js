//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';

import { AppKitContext } from './context';

/**
 * MessageLog is used for logging tracking messages, e.g. when a user registers, performs invitation, etc.
 */
export const useMessageLog = () => {
  const { messageLog = () => {} } = useContext(AppKitContext);
  return messageLog;
};
