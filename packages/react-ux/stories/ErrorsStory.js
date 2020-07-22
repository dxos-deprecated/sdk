//
// Copyright 2020 DXOS.org
//

import React from 'react';
import ErrorBoundary from '../src/components/ErrorBoundary';

export const WithErrorBoundary = () => {
  const handleError = (...args) => console.error(...args);

  return (
    <ErrorBoundary
      onError={handleError}
      onRestart={() => {}}
      onReset={() => {}}
    >
      <p>There is no error</p>
    </ErrorBoundary>
  );
};
