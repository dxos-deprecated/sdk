//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

import { useClient, useProfile } from '@dxos/react-client';
import { createUrl, useQuery } from '@dxos/react-router';

/**
 * Wraps `Route` components and `Redirect`s to the given path if a wallet is not detected.
 *
 * ```
 * <RequireWallet redirect="/register">
 *   <Route exact path="/:topic/:item" component={App} />
 * </RequireWallet>
 * ```
 */
const RequireWallet = ({ children, redirect = '/', isRequired = () => true }) => {
  const query = useQuery();
  let { pathname } = useLocation();
  const client = useClient();
  const profile = useProfile();

  const hasIdentity = !!profile || !!client.getProfile(); // This covers an edge case when claiming device invitation, when the profile is there but `useProfile` has not updated yet.
  // The 'useProfile' does update properly but the component issues a redirection already and has no chance of reacting to that
  if (!hasIdentity) {
    if (pathname === '/') {
      pathname = undefined;
    }

    if (isRequired(pathname, query)) {
      return <Redirect to={createUrl(redirect, { ...query, redirectUrl: pathname })} />;
    }
  }

  return children;
};

export default RequireWallet;
