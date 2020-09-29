//
// Copyright 2020 DXOS.org
//

import { useState, useEffect } from 'react';
import { useClient } from './client';

export const useItems = ({ partyKey, ...filter } = {}) => {
  const { client } = useClient();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!client) return;
    let unsubscribe;
    setImmediate(async () => {
      const party = await client.echo.getParty(partyKey);
      const result = await party.datababse.queryItems(filter);
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
  }, [client]);

  return items;
};
