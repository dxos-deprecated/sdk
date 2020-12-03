//
// Copyright 2020 DXOS.org
//

import { useState, useEffect } from 'react';

import { useRegistry } from './registry';
import { QueryRecord, WRN_TYPE_BOT_FACTORY } from './types';

interface RegistryBotFactoryRecord {
  topic: string,
  name?: string,
  names: string[]
}

export const useRegistryBotFactories = () => {
  const registry = useRegistry();
  const [factories, setFactories] = useState<RegistryBotFactoryRecord[]>([]);

  useEffect(() => {
    if (!registry) {
      return;
    }

    const queryRegistry = async () => {
      const factoriesResult = await registry.queryRecords({ type: WRN_TYPE_BOT_FACTORY }) as QueryRecord[];
      setFactories(factoriesResult.map(({ attributes: { topic, name }, names }) => ({
        topic,
        name,
        names
      })));
    };

    queryRegistry();
  }, [registry]);

  return factories;
};
