//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import { keyToString } from '@dxos/crypto';
import { schema } from '@dxos/echo-protocol';
import { useClient, useItems } from '@dxos/react-client';

import { DefaultSettingsDialog, PartyCard } from '../components';
import { download } from '../helpers';
import { useAppRouter, usePads } from '../hooks';

const PartyCardContainer = ({ party, ipfs }) => {
  const client = useClient();
  const router = useAppRouter();
  const [pads] = usePads();
  const items = useItems({ partyKey: party.key, type: pads.map(pad => pad.type) });
  const [newItemType, setNewItemType] = useState(undefined);
  const [itemSettingsOpen, setItemSettingsOpen] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);

  const handleSavedSettings = async ({ name }, metadata = {}, callback) => {
    const pad = pads.find(p => p.type === newItemType);
    const item = await pad.create({ party, client }, { name }, metadata);
    callback && callback(item);
    handleCanceledSettings();
    router.push({ topic: keyToString(party.key.asUint8Array()), item: item.id });
  };

  const handleCanceledSettings = () => {
    setItemSettingsOpen(false);
    setNewItemType(undefined);
  };

  const handleNewItemRequested = ({ type }) => {
    setNewItemType(type);
    setItemSettingsOpen(true);
  };

  const handleExportToIpfs = undefined; // TODO(rzadp): Reimplement for new ECHO

  const handleExportToFile = async () => {
    if (exportInProgress) {
      return;
    }
    setExportInProgress(true);

    try {
      const snapshot = party.database.createSnapshot();
      const encodedSnapshot = schema.getCodecForType('dxos.echo.snapshot.DatabaseSnapshot').encode(snapshot);

      const encodedToString = encodedSnapshot.toString('hex');
      download(encodedToString, 'party-contents.txt');
    } catch (e) {
      console.error('Export unsuccessful');
      console.error(e.stack);
    } finally {
      setExportInProgress(false);
    }
  };

  const pad = newItemType ? pads.find(pad => pad.type === newItemType) : undefined;
  const Settings = (pad && pad.settings) ? pad.settings : DefaultSettingsDialog;

  return (
    <>
      <PartyCard
        client={client}
        party={party}
        items={items}
        router={router}
        pads={pads}
        exportInProgress={exportInProgress}
        onNewItemRequested={handleNewItemRequested}
        onExportToFile={handleExportToFile}
        onExportToIpfs={ipfs ? handleExportToIpfs : undefined}
      />
      <Settings
        party={party}
        topic={party.key}
        open={itemSettingsOpen}
        onClose={handleSavedSettings}
        onCancel={handleCanceledSettings}
        item={undefined} // no item!
      />
    </>
  );
};

export default PartyCardContainer;
