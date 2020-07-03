//
// Copyright 2020 DXOS.
//

const path = require('path');
const execa = require('execa');
const debug = require('debug');
const pEvent = require('p-event');
const EventEmitter = require('events');
const browserRunner = require('@dxos/browser-runner');

const createRPC = require('./create-rpc');

const signalLog = debug('spawn-testing:signal');
const peerLog = debug('spawn-testing:peer');

function spawn (command, args) {
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

function fork (file, args, opts = {}) {
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

async function forkBrowser() {
  const child = await browserRunner.run({
    src: path.resolve('./src/peer.js'),
  });
  return child
}

module.exports = class Broker {
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

  async createPeer () {
    const child = fork(path.resolve('./src/peer.js'));
    console.log('forked')
    const rpc = createRPC(child);
    this._peers.add(rpc);
    await rpc.open();
    console.log('open')

    await rpc.once('ready');
    console.log('ready')

    return rpc;
  }

  async createBrowser() {
    const child = await forkBrowser()
    console.log('forked')
    const rpc = createRPC(child);
    this._peers.add(rpc);
    await rpc.open();
    console.log('open')
    await rpc.once('ready');
    console.log('ready')

    return rpc;
  }

  async destroy () {
    process.nextTick(() => this._signal.cancel());
    await this._signal.catch(() => {});
    await Promise.all(this.peers.map(peer => peer.close()));
  }
};

