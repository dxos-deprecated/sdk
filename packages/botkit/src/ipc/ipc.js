//
// Copyright 2020 DXOS.org
//

import ipc from 'node-ipc';

import { IPCServer } from './ipc-server';
import { IPCClient } from './ipc-client';

const setupIPC = (id, port) => {
  Object.assign(ipc.config, { id, networkPort: port, silent: true, rawBuffer: true, encoding: 'hex' });
};

/**
 * Start Server for inter-process communication.
 * @param {Object} config
 * @param {Function} messageHandler
 */
export const startIPCServer = async (config, messageHandler) => {
  const id = `bot-${process.pid}`;
  setupIPC(id, config.get('bot.ipc.port'));

  ipc.serveNet(() => {});
  ipc.server.start();

  return new IPCServer(ipc, id, messageHandler);
};

/**
 * Start Client for inter-process communication.
 * @param {Object} config
 * @param {Function} messageHandler
 */
export const startIPCClient = (config, messageHandler) => {
  return new Promise((resolve) => {
    const id = config.get('bot.uid');

    const port = config.get('bot.ipc.port');
    const serverId = config.get('bot.ipc.serverId');
    setupIPC(id, port);

    ipc.connectToNet(serverId, () => {
      resolve(new IPCClient(ipc, serverId, id, messageHandler));
    });
  });
};
