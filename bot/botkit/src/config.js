//
// Copyright 2020 DXOS.org
//

import yaml from 'js-yaml';
import defaultsDeep from 'lodash.defaultsdeep';

import { Config, mapFromKeyValues } from '@dxos/config';
import { createId, createKeyPair, keyToString } from '@dxos/crypto';

import defaults from './defaults.json';
import envmap from './env-map.json';

export const BOT_CONFIG_FILENAME = 'bot.yml';

/**
 * Get config from default or specified .yml file.
 * @param {string} configFilePath
 * @param {Object} argvConf
 */
export const getConfig = () => {
  const keyPair = createKeyPair();

  const config = new Config(
    mapFromKeyValues(yaml.load(envmap), process.env),
    yaml.load(defaults),
    {
      bot: {
        peerId: createId(),
        topic: keyToString(keyPair.publicKey),
        secretKey: keyToString(keyPair.secretKey)
      }
    }
  );

  return config;
};

export const getClientConfig = (config) => {
  const { client = {}, services: { signal: { server }, ice } } = config.values;
  const clientConf = {
    swarm: {
      signal: server,
      ice
    }
  };
  return defaultsDeep({}, clientConf, client);
};
