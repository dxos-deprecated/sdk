//
// Copyright 2020 DXOS.org
//

import { useEffect, useState } from 'react';
import assert from 'assert';

import { useModel } from '@dxos/react-client';

/**
 * Provides a model for all the party contents,
 * can be used to download/save a party
 */
export const usePartyContents = (topic) => {
  const [items, setItems] = useState([]);
  const type = ['wrn_dxos_org_teamwork_messenger_channel', 'wrn_dxos_org_teamwork_messenger_message'];
  const model = useModel({ model: undefined, options: { type, topic } });

  useEffect(() => {
    if (!model) return;
    setItems(model.messages);
  }, [model]);

  return {
    model,
    items,
    restore: (messages) => {
      assert(model);
      messages.forEach(msg => model.appendMessage(msg));
    }
  };
};
