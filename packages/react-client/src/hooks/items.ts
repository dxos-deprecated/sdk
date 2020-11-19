//
// Copyright 2020 DXOS.org
//

import { useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { keyToString } from '@dxos/crypto';

import { useClient } from './client';

export interface UseItemsProps {
  partyKey: Uint8Array
}

export const useItems = ({ partyKey, ...filter }: UseItemsProps) => {
  const client = useClient();
  const party = client.echo.getParty(partyKey);
  const key = keyToString(partyKey);
  const [items, setItems] = useState<any[]>([]);

  if (!party) {
    throw new Error('Party not found.');
  }

  useDeepCompareEffect(() => {
    const result = party.database.queryItems(filter);

    const unsubscribe = result.subscribe(() => {
      setItems(result.value);
    });
    setItems(result.value);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [key, filter]);

  return items;
};
