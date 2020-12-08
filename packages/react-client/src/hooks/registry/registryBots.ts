//
// Copyright 2020 DXOS.org
//

import { useState, useEffect } from 'react';

import { useRegistry } from './registry';
import { QueryRecord, WRN_TYPE_BOT } from './types';

interface RegistryBotRecord {
  version: string,
  name: string,
  names: string[],
  keywords: string[]
}

export interface UseRegistryBotsProps {
  sortByKeywords?: string[],
}

export const useRegistryBots = ({ sortByKeywords }: UseRegistryBotsProps = {}) => {
  const registry = useRegistry();
  const [registryBots, setRegistryBots] = useState<RegistryBotRecord[]>([]);

  useEffect(() => {
    if (!registry) {
      return;
    }

    const queryRegistry = async () => {
      const botsResult = await registry.queryRecords({ type: WRN_TYPE_BOT }) as QueryRecord[];
      const botRecords: RegistryBotRecord[] = botsResult.map(({ attributes: { version, name, keywords = [] }, names }) => ({
        version,
        name,
        names,
        keywords
      }));

      if (sortByKeywords === undefined) {
        setRegistryBots(botRecords);
      } else {
        const filterByKeywords = (bot: RegistryBotRecord) => bot.keywords.some(botKeyword => sortByKeywords.includes(botKeyword));
        const sortedBotRecords = [
          ...botRecords.filter(bot => filterByKeywords(bot)),
          ...botRecords.filter(bot => !filterByKeywords(bot))
        ];
        setRegistryBots(sortedBotRecords);
      }
    };

    queryRegistry();
  }, [registry]);

  return registryBots;
};
