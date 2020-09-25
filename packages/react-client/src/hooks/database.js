//
// Copyright 2020 DXOS.org
//

import { useContext } from 'react';
import { ClientContext } from './context';

export const useDatabase = () => {
  const { client } = useContext(ClientContext);
  return client.database;
};
