//
// Copyright 2020 DXOS.
//

import debug from 'debug';

export const BASE_DEBUG = 'bot-factory';

export const logBot = new Proxy({}, {
  get: (target, name) => {
    if (!target[name]) {
      target[name] = debug(`${BASE_DEBUG}:${name}`);
    }

    return target[name];
  }
});

export const log = debug(BASE_DEBUG);
