//
// Copyright 2020 DXOS.org
//

import { useEffect, useState } from 'react';

import { useClient } from './client';

/**
 * Returns an Array of all known Contacts across all Parties.
 * @returns [Array<Contacts>]
 */
export function useContacts () {
  const client = useClient();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    client.getContacts().then(contacts => setContacts(contacts));
  }, []);

  return [contacts];
}
