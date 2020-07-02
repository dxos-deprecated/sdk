//
// Copyright 2020 DXOS.org
//

import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import { ErrorHandler } from '@dxos/debug';
import { ClientContextProvider } from '@dxos/react-client';
import {
  DefaultRouter,
  Registration,
  RequireWallet,
  AppKitContextProvider
} from '@dxos/react-appkit';

import Home from './Home';

const Root = ({ config }) => {
  const router = { ...DefaultRouter, publicUrl: config.app.publicUrl || '/' };
  const { routes } = router;

  return (
    <ClientContextProvider config={config}>
      <AppKitContextProvider
        initialState={{}}
        errorHandler={new ErrorHandler()}
        router={router}
        pads={[]}
      >
        <HashRouter>
          <Switch>
            <Route exact path={routes.register} component={Registration} />
            <RequireWallet redirect={routes.register}>
              <Route exact path="/" component={Home} />
            </RequireWallet>
          </Switch>
        </HashRouter>
      </AppKitContextProvider>
    </ClientContextProvider>
  );
};

export default Root;
