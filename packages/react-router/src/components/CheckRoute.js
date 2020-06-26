//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';
import { Redirect, useLocation, useParams } from 'react-router-dom';
import queryString from 'query-string';

/**
 * Wraps react-router Route with condition checks that may cuase a runtime redirect.
 * @returns {Object} React component.
 * @constructor
 */
export const CheckRoute = ({ children, preconditions = [] }) => {
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
