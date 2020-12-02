//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import { keyToString, PublicKey } from '@dxos/crypto';
import { Timeframe, schema } from '@dxos/echo-protocol';
import { useClient, useItems } from '@dxos/react-client';

import { DefaultSettingsDialog, PartyCard } from '../components';
import { download } from '../helpers';
import { useAppRouter, usePads, usePartyRestore } from '../hooks';

const PartyCardContainer = ({ party, ipfs }) => {
  const client = useClient();
  const router = useAppRouter();
  const [pads] = usePads();
  const items = useItems({ partyKey: party.key, type: pads.map(pad => pad.type) });
  const [newItemType, setNewItemType] = useState(undefined);
  const [itemSettingsOpen, setItemSettingsOpen] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);
  const partyRestore = usePartyRestore(party.key, pads);

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

  const handleExportToIpfs = async () => {
    // OLD behaviour
    // const data = partyRestore.export();
    // return ipfs.upload(data, 'text/plain');
  };

  const handleExportToFile = async () => {
    // OLD behaviour
    // const data = partyRestore.export();
    // download(data, `${party.displayName || 'party-contents'}.json`);

    if (exportInProgress) {
      return;
    }
    setExportInProgress(true);

    const snapshot = party.database.createSnapshot();
    console.log('snapshot', snapshot);
    const encodedSnapshot = schema.getCodecForType('dxos.echo.snapshot.DatabaseSnapshot').encode(snapshot);
    console.log('encodedSnapshot', encodedSnapshot);
    download(keyToString(encodedSnapshot), 'party-contents.txt');
    // try {
    //   const feedDescriptors = client.echo.feedStore.getDescriptors();
    //   console.log('feedDescriptors', feedDescriptors);
    //   const feedDescriptorsOfParty = feedDescriptors.filter(descriptor => PublicKey.equals(descriptor.metadata.partyKey, party.key));
    //   console.log('feedDescriptorsOfParty', feedDescriptorsOfParty);
    //   if (feedDescriptorsOfParty.length !== 1) {
    //     throw new Error('Feed descriptor for a party not found.')
    //   }
    //   const result = await Promise.all(feedDescriptorsOfParty.map(descriptor => new Promise((resolve, reject) => {
    //     descriptor.feed.getBatch(0, descriptor.feed.length, (err, data) => {
    //       if(err) reject(err)
    //       else {
    //         resolve({
    //           key: descriptor.feed.key,
    //           data: data.filter(data => data.echo).map(data => {
    //             // data.echo.timeframe = new Timeframe();
    //             return data
    //           })
    //         })
    //       }
    //     })
    //   })));
    //   console.log('result', result)
    // } catch (e) {
    //   console.error('File export unsuccessful');
    //   console.error(e.stack);
    //   setExportInProgress(false);
    // }

    // https://github.com/hypercore-protocol/hypercore#const-id--feeddownloadrange-callback
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
        onExport={ipfs ? handleExportToIpfs : undefined}
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
