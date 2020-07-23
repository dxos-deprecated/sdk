//
// Copyright 2020 DXOS.org
//

import { useState, useEffect } from 'react';

import { Registry } from '@wirelineio/registry-client';
import { useConfig } from '@dxos/react-client';

// TODO(burdon): Factor out constants to client.
const WRN_TYPE_BOT = 'wrn:bot';
const WRN_TYPE_BOT_FACTORY = 'wrn:bot-factory';

// TODO(burdon): Move hook to data-client.
export const useRegistry = () => {
  // TODO(burdon): Get from config.
  // const { services: { wns: { server, chainId } } } = useConfig();
  // https://github.com/wirelineio/incubator/pull/856/files#diff-b97cbda4bd74ecf935c38c2f3c103b2aR14
  const config = useConfig();
  console.log(config);
  const { server, chainId } = { server: 'https://node1.dxos.network/wns/api', chainId: 'wireline' };

  // TODO(burdon): Must not create these objects in a hook -- get from context (so able to mock).
  const [registry] = useState(() => new Registry(server, chainId));
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
