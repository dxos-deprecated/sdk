//
// Copyright 2020 DXOS.org
//

import { useState, useEffect } from 'React';
import { useClient } from './client';

export const useItems = ({ partyKey }) => {
  const { client: { database } } = useClient();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let unsubscribe;
    setImmediate(async () => {
      const party = await database.getParty(partyKey);
      const result = await party.queryItems();
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
  }, []);

  return items;
};
