//
// Copyright 2020 DXOS.org
//

import assert from 'assert';

import { codec, createConnectConfirmMessage } from '../codec';

/**
 * Inter Process Communication (IPC) Client.
 * Provides IPC functional for child processes.
 */
export class IPCClient {
  /**
   * @constructor
   * @param {Object} ipc
   * @param {String} serverId
   * @param {String} id
   * @param {Function} messageHandler
   */
  constructor (ipc, serverId, id, messageHandler) {
    assert(ipc);
    assert(serverId);
    assert(id);
    assert(messageHandler);

    this._serverId = serverId;
    this._ipc = ipc;
    this._id = id;
    this._messageHandler = messageHandler;

    this._responseCallback = null;
    this._ipc.of[this._serverId].on('data', async data => {
      const { message } = codec.decode(data);
      if (this._responseCallback) {
        this._responseCallback(message);
      } else {
        const response = await this._messageHandler(message);
        if (response) {
          const buffer = codec.encode(response);
          this._ipc.of[this._serverId].emit(buffer);
        }
      }
    });
  }

  /**
   * Send message to IPC server.
   * @param {Object} message
   * @param {Object} options
   */
  async sendMessage (message, { waitForResponse = false } = {}) {
    return new Promise((resolve) => {
      const buffer = codec.encode(message);
      this._ipc.of[this._serverId].emit(buffer);
      if (waitForResponse) {
        this._responseCallback = (response) => {
          this._responseCallback = null;
          resolve(response);
        };
      }
    });
  }

  confirmConnection () {
    const buffer = codec.encode(createConnectConfirmMessage(this._id));
    this._ipc.of[this._serverId].emit(buffer);
  }
}
