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
    console.warn('No registry. Configure WNS in your Client config in order to gain access to WNS registry.');
  }

  return registry;
};

export const useRegistryBots = () => {
  const registry = useRegistry();
  const [registryBots, setRegistryBots] = useState([]);

  useEffect(() => {
    if (!registry) {
      return;
    }

    const queryRegistry = async () => {
      const botsResult = await registry.queryRecords({ type: WRN_TYPE_BOT });
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

export const useRegistryBotFactories = () => {
  const registry = useRegistry();
  const [factories, setFactories] = useState([]);

  useEffect(() => {
    if (!registry) {
      return;
    }

    const queryRegistry = async () => {
      const factoriesResult = await registry.queryRecords({ type: WRN_TYPE_BOT_FACTORY });
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
