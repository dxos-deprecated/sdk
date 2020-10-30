//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { useEffect, useState } from 'react';

import { useModel } from '@dxos/react-client';

/**
 * Provides a model for all the party contents,
 * can be used to download/save a party
 */
export const usePartyRestore = (topic, pads) => {
  const [items, setItems] = useState([]);

  const type = [
    ...pads.map(p => p.type).flat(),
    ...pads.map(p => p.contentType).flat()
  ].filter(t => !!t);

  const model = useModel({ model: undefined, options: { type, topic } });

  useEffect(() => {
    if (!model) {
      return;
    }
    setItems(model.messages);
  }, [model]);

  return {
    export: () => {
      const strippedItems = items.map(i => ({ ...i, __meta: undefined }));
      return JSON.stringify(strippedItems);
    },
    restore: (messages) => {
      assert(model);
      messages.forEach(msg => model.appendMessage(msg));
    }
  };
};
