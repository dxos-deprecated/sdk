//
// Copyright 2020 DXOS.org
//

import { LocationDescriptor } from 'history';
import queryString from 'query-string';
import React from 'react';
import { Redirect, useLocation, useParams } from 'react-router-dom';

/**
 * Wraps react-router Route with condition checks that may cuase a runtime redirect.
 */
// eslint-disable-next-line jest/no-export
export const CheckRoute = ({
  children,
  preconditions = []
}: {
  children: React.ReactNode,
  preconditions: ((args: any) => LocationDescriptor)[]
}) => {
  const { pathname: path, search } = useLocation();
  const params = useParams();
  const query = queryString.parse(search);

  // Try the tests and redirect on failure.
  for (const test of preconditions) {
    const redirect = test({ params, query, path });
    if (redirect) {
      return <Redirect to={redirect} />;
    }
  }

  return children;
};
