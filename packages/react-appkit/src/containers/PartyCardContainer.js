//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import assert from 'assert';

import { keyToString } from '@dxos/crypto';

import { useClient } from '@dxos/react-client';

import PartyCard from '../components/PartyCard';
import { useAppRouter, usePads, useViews } from '../hooks';
import DefaultSettingsDialog from './DefaultSettingsDialog';

const PartyCardContainer = ({ party }) => {
  const client = useClient();
  const router = useAppRouter();
  const [pads] = usePads();
  const topic = keyToString(party.publicKey);
  const { model, createView } = useViews(topic);
  const [newViewType, setNewViewType] = useState(undefined);
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);

  const handleSavedSettings = ({ name }, metadata = {}, callback) => {
    assert(newViewType);
    const viewId = createView(newViewType, name, metadata);
    handleCanceledSettings();
    callback && callback(viewId);
    router.push({ topic, item: viewId });
  };

  const handleCanceledSettings = () => {
    setViewSettingsOpen(false);
    setNewViewType(undefined);
  };

  const handleNewItemRequested = ({ type }) => {
    setNewViewType(type);
    setViewSettingsOpen(true);
  };

  const pad = newViewType ? pads.find(pad => pad.type === newViewType) : undefined;
  const Settings = (pad && pad.settings) ? pad.settings : DefaultSettingsDialog;

  return (
    <>
      <PartyCard
        client={client}
        party={party}
        viewModel={model}
        createView={createView}
        router={router}
        pads={pads}
        onNewItemRequested={handleNewItemRequested}
      />
      <Settings
        party={party}
        topic={topic}
        open={viewSettingsOpen}
        onClose={handleSavedSettings}
        onCancel={handleCanceledSettings}
        item={undefined} // no item!
        viewModel={model}
      />
    </>
  );
};

export default PartyCardContainer;
