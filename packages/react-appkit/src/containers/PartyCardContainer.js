//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import { keyToBuffer, keyToString } from '@dxos/crypto';
import { useClient, useItems } from '@dxos/react-client';

import PartyCard from '../components/PartyCard';
import { useAppRouter, usePads } from '../hooks';
import DefaultSettingsDialog from './DefaultSettingsDialog';

const PartyCardContainer = ({ party }) => {
  const client = useClient();
  const router = useAppRouter();
  const [pads] = usePads();
  const topic = keyToString(party.key);
  const items = useItems({ partyKey: keyToBuffer(topic), type: pads.map(pad => pad.type) });
  const [newItemType, setNewItemType] = useState(undefined);
  const [itemSettingsOpen, setItemSettingsOpen] = useState(false);

  const handleSavedSettings = async ({ name }, metadata = {}, callback) => {
    const pad = pads.find(p => p.type === newItemType);
    const item = await pad.create({ party, client }, { name }, metadata);
    callback && callback(item);
    router.push({ topic, item: item.id });
    handleCanceledSettings();
  };

  const handleCanceledSettings = () => {
    setItemSettingsOpen(false);
    setNewItemType(undefined);
  };

  const handleNewItemRequested = ({ type }) => {
    setNewItemType(type);
    setItemSettingsOpen(true);
  };

  const pad = newItemType ? pads.find(pad => pad.type === newItemType) : undefined;
  const Settings = (pad && pad.settings) ? pad.settings : DefaultSettingsDialog;

  return (
    <>
      <PartyCard
        client={client}
        party={party}
        itemModel={items}
        router={router}
        pads={pads}
        onNewItemRequested={handleNewItemRequested}
        onExport={undefined} // not yet ported
      />
      <Settings
        party={party}
        topic={topic}
        open={itemSettingsOpen}
        onClose={handleSavedSettings}
        onCancel={handleCanceledSettings}
        item={undefined} // no item!
      />
    </>
  );
};

export default PartyCardContainer;
