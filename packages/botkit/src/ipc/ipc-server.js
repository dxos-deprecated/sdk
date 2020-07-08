//
// Copyright 2020 DXOS.org
//

import assert from 'assert';

import { MESSAGE_CONFIRM, codec } from './codec';

/**
 * Inter Process Communication (IPC) Server.
 * IPC is used for establishing messaging channel between different processes.
 * IPC Server provides IPC functional for parent process.
 */
export class IPCServer {
  /** @type {Map<String, Socket>} */
  _clients = new Map();

  /**
   * @constructor
   * @param {Object} ipc
   * @param {String} id
   * @param {Function} messageHandler
   */
  constructor (ipc, id, messageHandler) {
    assert(ipc);
    assert(id);
    assert(messageHandler);

    this._ipc = ipc;
    this._id = id;
    this._messageHandler = messageHandler;

    this._ipc.server.on('data', async (data, socket) => {
      const { message } = codec.decode(data);

      if (this._responseCallback) {
        this._responseCallback(message);
      } else {
        switch (message.__type_url) {
          case MESSAGE_CONFIRM: {
            const { id } = message;
            this._clients.set(id, socket);
            break;
          }

          default: {
            const response = await this._messageHandler(message);
            if (response) {
              const buffer = codec.encode(response);
              ipc.server.emit(socket, buffer);
            }
          }
        }
      }
    });
  }

  /**
   * Get Server Id.
   */
  get id () {
    return this._id;
  }

  clientConnected (id) {
    return this._clients.has(id);
  }

  /**
   * Send message to IPC client.
   * @param {String} botUID
   * @param {Object} message
   * @param {Object} options
   */
  async sendMessage (botUID, message, { waitForResponse = false } = {}) {
    return new Promise((resolve) => {
      const buffer = codec.encode(message);
      const socket = this._clients.get(botUID);

      this._ipc.server.emit(socket, buffer);
      if (waitForResponse) {
        this._responseCallback = (response) => {
          this._responseCallback = null;
          resolve(response);
        };
      }
    });
  }

  stop () {
    this._ipc.server.stop();
  }
}
