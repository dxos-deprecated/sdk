//
// Copyright 2020 DXOS.org
//

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Home } from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';

import { noop } from '@dxos/async';
import { keyToBuffer } from '@dxos/crypto';
import { useClient } from '@dxos/react-client';

import AppContainer from './AppContainer';
import Sidebar from './DefaultViewSidebar';
import ViewSettings from '../components/ViewSettings';

import { useAppRouter, usePads, useViews } from '../hooks';

const ViewSettingsContainer = () => {
  const router = useAppRouter();
  const { topic, item: viewId } = useParams();
  const [pads] = usePads();
  const { model } = useViews(topic);
  const client = useClient();

  useEffect(() => {
    if (topic) {
      client.partyManager.openParty(keyToBuffer(topic)).then(noop);
    }
  }, [topic]);

  const appBarContent = (
    <IconButton color='inherit'>
      <Home onClick={() => router.push({ path: '/home' })} />
    </IconButton>
  );

  return (
    <AppContainer
      appBarContent={appBarContent}
      sidebarContent={<Sidebar />}
    >
      <ViewSettings
        router={router}
        viewModel={model}
        topic={topic}
        pads={pads}
        viewId={viewId}
      />
    </AppContainer>
  );
};

export default ViewSettingsContainer;
