//
// Copyright 2018 DXOS.org
//

import assert from 'assert';
import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import TreeView from '@material-ui/lab/TreeView';
import { Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { useParty } from '@dxos/react-client';

import {
  MemberList,
  NewItemCreationMenu,
  // PartyTreeAddItemButton,
  PartyTreeItem
} from '../components';

import { usePads, useAppRouter, useItems } from '../hooks';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: '1fr auto',
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
  }
}));

const DefaultItemList = () => {
  const router = useAppRouter();
  const party = useParty();
  const classes = useStyles();
  const { topic, item: active } = useParams();
  const [pads] = usePads();
  const { model, createItem } = useItems(topic);
  const [newItemCreationMenuOpen, setNewItemCreationMenuOpen] = useState(false);
  const anchor = useRef();

  const handleSelect = (itemId) => {
    router.push({ topic, item: itemId });
  };

  const handleCreate = (type) => {
    assert(type);
    setNewItemCreationMenuOpen(false);
    const itemId = createItem(type);
    handleSelect(itemId);
  };

  return (
    <div className={classes.root}>
      <TreeView>
        {model.getAllItems().map(item => (
          <PartyTreeItem
            key={item.itemId}
            id={item.itemId}
            label={item.displayName}
            icon={pads.find(pad => pad.type === item.type)?.icon}
            isSelected={active === item.itemId}
            onSelect={() => handleSelect(item.itemId)}
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
