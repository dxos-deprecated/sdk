//
// Copyright 2018 DXOS.org
//

import assert from 'assert';
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';

import { keyToBuffer, keyToString, PublicKey } from '@dxos/crypto';
import { ObjectModel } from '@dxos/object-model';
import { useParty, useItems } from '@dxos/react-client';

import {
  NewItemCreationMenu,
  // PartyTreeAddItemButton,
  PartyTreeItem
} from '../components';
import MemberList from '../components/MemberList';
import { usePads, useAppRouter } from '../hooks';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: '1fr auto',
    gridTemplateColumns: '100%',
    flex: 1
  },
  homeButtonLabel: {
    display: 'flex',
    overflow: 'hidden',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0)
  },
  homeButtonIcon: {
    marginRight: 8
  },
  item: {
    textOverflow: 'ellipsis'
  }
}));

const DefaultItemList = () => {
  const router = useAppRouter();
  const { topic, item: active } = useParams();
  const party = useParty(PublicKey.from(topic));
  const classes = useStyles();
  const [pads] = usePads();
  const items = useItems({ partyKey: keyToBuffer(topic), type: pads.map(pad => pad.type) });
  const [newItemCreationMenuOpen, setNewItemCreationMenuOpen] = useState(false);
  const anchor = useRef();

  const handleSelect = (itemId) => {
    router.push({ topic: keyToString(party.key.asUint8Array()), item: itemId });
  };

  const handleCreate = async (type) => {
    assert(type);
    setNewItemCreationMenuOpen(false);
    const itemId = await party.database.createItem({
      model: ObjectModel,
      type: type,
      props: {}
    });
    handleSelect(itemId);
  };

  return (
    <div className={classes.root}>
      <TreeView>
        {items.map(item => (
          <PartyTreeItem
            className={classes.item}
            key={item.id}
            id={item.id}
            label={item._model.getProperty('title') || 'Untitled'}
            icon={pads.find(pad => pad.type === item.type)?.icon}
            isSelected={active === item.id}
            onSelect={() => handleSelect(item.id)}
          />
        ))}

        {/* <PartyTreeAddItemButton ref={anchor} topic={topic} onClick={() => setNewItemCreationMenuOpen(true)}>Item</PartyTreeAddItemButton> */}
        <NewItemCreationMenu anchorEl={anchor.current} open={newItemCreationMenuOpen} onSelect={handleCreate} onClose={() => setNewItemCreationMenuOpen(false)} pads={pads} />
      </TreeView>
      <Divider />
      <MemberList party={party} />
    </div>
  );
};

export default DefaultItemList;
