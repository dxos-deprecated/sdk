//
// Copyright 2020 DXOS.org
//

import { useEffect, useState } from 'react';

import { useClient } from '@dxos/react-client';

export function useContacts () {
  const client = useClient();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    client.getContacts().then(contacts => setContacts(contacts));
  }, []);

  return [contacts];
}
