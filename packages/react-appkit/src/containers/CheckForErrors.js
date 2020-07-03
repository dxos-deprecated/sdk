//
// Copyright 2020 DXOS.org
//

// eslint-disable-next-line no-unused-vars
import React from 'react';

import { useClient, useInitError } from '@dxos/react-client';

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
