//
// Copyright 2020 DXOS.org
//

import { useEffect, useState } from 'react';

import { keyToString } from '@dxos/crypto';

export const useMembers = (party) => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!party) return;
    const result = party.queryMembers();
    setMembers(result.value);

    return result.subscribe(() => {
      setMembers(result.value);
    });
  }, [party && keyToString(party.key)]);

  return members;
};
