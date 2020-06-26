//
// Copyright 2020 DXOS.
//

import React from 'react';
import { Route } from 'react-router-dom';

import Authenticator from './Authenticator';
import FeedStore from './FeedStore';
import FeedViewer from './FeedViewer';
import KeyRing from './KeyRing';
import Members from './Members';

/**
 * Default system routes.
 * NOTE: This component must be used via a Route component since Switch directives only apply to direct child.
 */
const SystemRoutes = (router) => {
  const { routes } = router;

  return (
    <Route exact path={[routes.auth, routes.keys, routes.store, routes.feed, routes.members]}>
      <Route exact path={routes.auth} component={Authenticator} />
      <Route exact path={routes.keys} component={KeyRing} />
      <Route exact path={routes.members} component={Members} />
      <Route exact path={routes.store} component={FeedStore} />
      <Route exact path={routes.feed} component={FeedViewer} />
    </Route>
  );
};

export default SystemRoutes;
