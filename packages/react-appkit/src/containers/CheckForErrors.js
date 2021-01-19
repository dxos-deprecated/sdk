//
// Copyright 2020 DXOS.org
//

import { useClient, useInitError } from '@dxos/react-client';

/**
 * @deprecated No longer required.
 */
const CheckForErrors = ({ children }) => {
  const initError = useInitError();
  if (initError) {
    throw initError;
  }

  const client = useClient();
  if (!client) {
    throw new Error('Failed to start.');
  }

  return children;
};

export default CheckForErrors;
