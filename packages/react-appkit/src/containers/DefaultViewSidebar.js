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
  NewViewCreationMenu,
  PartyTreeAddItemButton,
  PartyTreeItem
} from '../components';

import { usePads, useAppRouter, useViews } from '../hooks';

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

const DefaultViewSidebar = () => {
  const router = useAppRouter();
  const party = useParty();
  const classes = useStyles();
  const { topic, item: active } = useParams();
  const [pads] = usePads();
  const { model, createView } = useViews(topic);
  const [newViewCreationMenuOpen, setNewViewCreationMenuOpen] = useState(false);
  const anchor = useRef();

  const handleSelect = (viewId) => {
    router.push({ topic, item: viewId });
  };

  const handleCreate = (type) => {
    assert(type);
    setNewViewCreationMenuOpen(false);
    const viewId = createView(type);
    handleSelect(viewId);
  };

  return (
    <div className={classes.root}>
      <TreeView>
        {model.getAllViews().map(view => (
          <PartyTreeItem
            key={view.viewId}
            id={view.viewId}
            label={view.displayName}
            icon={pads.find(pad => pad.type === view.type)?.icon}
            isSelected={active === view.viewId}
            onSelect={() => handleSelect(view.viewId)}
          />
        ))}

        <PartyTreeAddItemButton ref={anchor} topic={topic} onClick={() => setNewViewCreationMenuOpen(true)}>Item</PartyTreeAddItemButton>
        <NewViewCreationMenu anchorEl={anchor.current} open={newViewCreationMenuOpen} onSelect={handleCreate} onClose={() => setNewViewCreationMenuOpen(false)} pads={pads} />
      </TreeView>
      <Divider />
      <MemberList party={party} />
    </div>
  );
};

export default DefaultViewSidebar;
