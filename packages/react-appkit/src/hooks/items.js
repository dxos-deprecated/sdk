//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { Chance } from 'chance';
import { useEffect, useState, useCallback } from 'react';

import { useModel } from '@dxos/react-client';
import { ItemModel } from '@dxos/view-model';

import { usePads } from './pads';

const chance = new Chance();

/**
 * Provides item list and item creator.
 * @returns {ItemModel}
 */
export const useItems = (topic) => {
  console.warn('New useItems from react-client should be used');
  const [items, setItems] = useState([]);
  const [pads] = usePads();
  const model = useModel({ model: ItemModel, options: { type: pads.map(pad => pad.type), topic } });

  useEffect(() => {
    if (!model) {
      return;
    }
    setItems(model.messages);
  }, [model]);

  const createItem = useCallback((type, title, metadata = {}) => {
    assert(model);
    return model.createItem(type, title || `item-${chance.word()}`, metadata);
  }, [model]);

  return {
    model: model ?? new ItemModel(),
    createItem,
    items
  };
};
