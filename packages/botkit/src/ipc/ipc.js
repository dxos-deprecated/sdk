//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import ipc from 'node-ipc';
import tcpPortUsed from 'tcp-port-used';

import { IPCServer } from './ipc-server';
import { IPCClient } from './ipc-client';

const findFreePort = async ({ port, portFrom, portTo } = {}) => {
  portFrom = port || portFrom;
  portTo = port || portTo;

  assert(portFrom && portTo, 'IPC Port not defined.');
  assert(portFrom <= portTo, 'Invalid IPC Port range.');

  for (port = portFrom; port <= portTo + 1; port++) {
    const inUse = await tcpPortUsed.check(port);
    if (!inUse) {
      break;
    }
  }
  assert(port <= portTo, 'Unable to find open port for IPC.');
  return port;
};

const setupIPC = (id, port) => {
  Object.assign(ipc.config, { id, networkPort: port, silent: true, rawBuffer: true, encoding: 'hex' });
};

/**
 * Start Server for inter-process communication.
 * @param {Object} config
 * @param {Function} messageHandler
 */
export const startIPCServer = async (config, messageHandler) => {
  const port = await findFreePort(config.get('bot.ipc'));
  const id = `bot-${process.pid}`;
  setupIPC(id, port);

  ipc.serveNet(() => {});
  ipc.server.start();

  return new IPCServer(ipc, id, port, messageHandler);
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
