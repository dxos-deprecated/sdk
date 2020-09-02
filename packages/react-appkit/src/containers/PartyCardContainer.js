//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';
import assert from 'assert';

import { keyToString } from '@dxos/crypto';

import { useClient } from '@dxos/react-client';

import PartyCard from '../components/PartyCard';
import download from '../download';
import { useAppRouter, usePads, useItems, usePartyRestore } from '../hooks';
import DefaultSettingsDialog from './DefaultSettingsDialog';

const PartyCardContainer = ({ party }) => {
  const client = useClient();
  const router = useAppRouter();
  const [pads] = usePads();
  const topic = keyToString(party.publicKey);
  const { model, createItem } = useItems(topic);
  const [newItemType, setNewItemType] = useState(undefined);
  const [itemSettingsOpen, setItemSettingsOpen] = useState(false);

  const partyRestore = usePartyRestore(topic, pads);

  const handleSavedSettings = ({ name }, metadata = {}, callback) => {
    assert(newItemType);
    const itemId = createItem(newItemType, name, metadata);
    handleCanceledSettings();
    callback && callback(itemId);
    router.push({ topic, item: itemId });
  };

  const handleCanceledSettings = () => {
    setItemSettingsOpen(false);
    setNewItemType(undefined);
  };

  const handleNewItemRequested = ({ type }) => {
    setNewItemType(type);
    setItemSettingsOpen(true);
  };

  const handleExport = () => {
    download(partyRestore.export(), `${party.displayName || 'party-contents'}.txt`);
  };

  const handleRestore = (data) => {
    const parsed = JSON.parse(data);
    assert(Array.isArray(parsed));
    partyRestore.restore(parsed);
  };

  const pad = newItemType ? pads.find(pad => pad.type === newItemType) : undefined;
  const Settings = (pad && pad.settings) ? pad.settings : DefaultSettingsDialog;

  return (
    <>
      <PartyCard
        client={client}
        party={party}
        itemModel={model}
        router={router}
        pads={pads}
        onNewItemRequested={handleNewItemRequested}
        onExport={handleExport}
        onRestore={handleRestore}
      />
      <Settings
        party={party}
        topic={topic}
        open={itemSettingsOpen}
        onClose={handleSavedSettings}
        onCancel={handleCanceledSettings}
        item={undefined} // no item!
        itemModel={model}
        Icon={pad && pad.icon}
      />
    </>
  );
};

export default PartyCardContainer;
