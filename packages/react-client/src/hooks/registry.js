//
// Copyright 2020 DXOS.org
//

import { useState, useEffect } from 'react';

import { useClient } from './client';

// TODO(burdon): Factor out constants to client.
const WRN_TYPE_BOT = 'wrn:bot';
const WRN_TYPE_BOT_FACTORY = 'wrn:bot-factory';

export const useRegistry = () => {
  const { registry } = useClient();
  if (!registry) {
    throw new Error('No registry. Configure registry in Client constructor.');
  }

  return registry;
};

export const useRegistryBots = () => {
  const registry = useRegistry();
  const [registryBots, setRegistryBots] = useState([]);

  useEffect(() => {
    const queryRegistry = async () => {
      const botsResult = await registry.queryRecords({ type: WRN_TYPE_BOT, version: '*' });
      setRegistryBots(botsResult.map(({ attributes: { version, name, displayName } }) => ({
        version,
        name,
        displayName
      })));
    };

    queryRegistry();
  }, [registry]);

  return registryBots;
};

export const useRegistryBotFactories = () => {
  const registry = useRegistry();
  const [factories, setFactories] = useState([]);

  useEffect(() => {
    const queryRegistry = async () => {
      const factoriesResult = await registry.queryRecords({ type: WRN_TYPE_BOT_FACTORY });
      setFactories(factoriesResult.map(({ attributes: { topic, name } }) => ({
        topic,
        name
      })));
    };

    queryRegistry();
  }, [registry]);

  return factories;
};
