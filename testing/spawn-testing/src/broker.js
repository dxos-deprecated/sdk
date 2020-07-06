//
// Copyright 2020 DXOS.
//

import path from 'path';
import execa from 'execa';
import debug from 'debug';
import pEvent from 'p-event';

import { createRPC } from './create-rpc';

const signalLog = debug('dxos:spawn-testing:signal');
const peerLog = debug('dxos:spawn-testing:peer');

function spawn (command, args = []) {
  const child = execa(command, args, {
    serialization: 'advanced',
    preferLocal: true
  });

  child.stdout.on('data', data => {
    signalLog(data.toString());
  });

  child.stderr.on('data', data => {
    signalLog(data.toString());
  });

  return child;
}

function fork (file, args = []) {
  const child = execa.node(file, args, {
    serialization: 'advanced',
    preferLocal: true
  });

  child.stdout.on('data', data => {
    peerLog(data.toString());
  });

  child.stderr.on('data', data => {
    peerLog(data.toString());
  });

  return child;
}

export class Broker {
  constructor () {
    this._signal = null;
    this._peers = new Set();
  }

  get peers () {
    return Array.from(this._peers.values());
  }

  createSignal (opts = {}) {
    const { port = 4000 } = opts;
    this._signal = spawn('discovery-swarm-webrtc', ['--port', port]);
    return pEvent(this._signal.stdout, 'data', {
      filter (data) {
        return data.toString().includes('discovery-swarm-webrtc running');
      }
    });
  }

  async createPeer (typeApp = 'ClientApp') {
    const child = fork(path.resolve(path.join(__dirname, 'peer.js')), ['--typeApp', typeApp]);
    const rpc = createRPC(child);
    this._peers.add(rpc);
    await rpc.open();
    await rpc.once('app-ready');
    return rpc;
  }

  async destroy () {
    process.nextTick(() => this._signal.cancel());
    await this._signal.catch(() => {});
    await Promise.all(this.peers.map(peer => peer.close()));
  }
}
