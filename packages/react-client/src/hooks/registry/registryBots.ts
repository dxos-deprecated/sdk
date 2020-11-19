//
// Copyright 2020 DXOS.org
//

import { useState, useEffect } from 'react';

import { useRegistry } from './registry';
import { QueryRecord, WRN_TYPE_BOT } from './types';

interface RegistryBotRecord {
  version: string,
  name: string,
  names: string[]
}

export const useRegistryBots = () => {
  const registry = useRegistry();
  const [registryBots, setRegistryBots] = useState<RegistryBotRecord[]>([]);

  useEffect(() => {
    if (!registry) {
      return;
    }

    const queryRegistry = async () => {
      const botsResult = await registry.queryRecords({ type: WRN_TYPE_BOT }) as QueryRecord[];
      setRegistryBots(botsResult.map(({ attributes: { version, name }, names }) => ({
        version,
        name,
        names
      })));
    };

    queryRegistry();
  }, [registry]);

  return registryBots;
};
