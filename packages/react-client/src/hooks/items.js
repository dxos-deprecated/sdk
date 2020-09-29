//
// Copyright 2020 DXOS.org
//

import { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { useParty } from './parties';

export const useItems = ({ partyKey, ...filter } = {}) => {
  const party = useParty(partyKey);
  const [items, setItems] = useState([]);

  useDeepCompareEffect(() => {
    let unsubscribe;
    if (!party) return;
    setImmediate(async () => {
      const result = await party.database.queryItems(filter);
      unsubscribe = result.subscribe(() => {
        setItems(result.value);
      });
      setItems(result.value);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [party, filter]);

  return items;
};
