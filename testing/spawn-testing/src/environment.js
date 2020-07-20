import debug from 'debug';
import { Broker } from './broker';
import dequal from 'dequal';
import { EventEmitter } from 'events';
import { open, write, close } from 'fs';
import { promisify } from 'util';

const log = debug('dxos:spawn-testing:environment');

export class Environment extends EventEmitter {
  constructor () {
    super();
    this._broker = new Broker();
    this._tickCount = 0;
  }

  async start () {
    await this._broker.createSignal();
  }

  async addPeers ({ count = 1, ...opts }) {
    for (let i = 0; i < count; i++) {
      await this._addAndInvitePeer(opts);
    }
  }

  async _addAndInvitePeer (opts) {
    const prevPeer = this._broker.peers[this._broker.peers.length - 1];
    const peer = await this._broker.createPeer(opts);
    if (!prevPeer) {
      const { publicKey } = await peer.call('createParty');
      log('> party created', publicKey.toString('hex'));
      this._partyKey = publicKey;
    } else {
      const invitation = await prevPeer.call('createInvitation', { publicKey: this._partyKey });
      log('> invitation created');

      await peer.call('joinParty', { invitation });
      log('> peer joined to the party');
    }
    await peer.call('initAgent');
  }

  async runTicks ({ count = 1, delay = 10, opts = {} } = {}) {
    for (let i = 0; i < count; i++) {
      for (const peer of this._broker.peers) {
        await peer.call('tick', opts);
      }
      this._tickCount++;
      this.emit('tick', { time: new Date(), number: this._tickCount });
      await sleep(delay);
    }
  }

  async comparePeerStates () {
    const modelObjects = await Promise.all(this._broker.peers.map(peer => peer.call('getModelObjects')));
    return modelObjects[0].length !== 0 && arrayItemsEqual(modelObjects, compareModelStates);
  }

  async areModelsReplicated() {
    const states = await Promise.all(this._broker.peers.map(peer => peer.call('getState')));
    const modelStates = states.map(state => Object.values(state.agent.models)[0])
    const totalAppended = modelStates.reduce((acc, state) => acc + state.appended, 0)
    return modelStates.every(state => state.updated + totalAppended)
  }

  waitForSync () {
    return new Promise(resolve => {
      const check = async () => {
        if (await this.areModelsReplicated()) {
          resolve();
        }
      };

      const peerStates = new Map();
      for (const [key, peer] of this._broker._peers) {
        peer.on('model-update', async ({ state }) => {
          peerStates.set(key, state);
          const states = Array.from(peerStates.values());
          const totalAppended = states.reduce((acc, state) => acc + state.appended, 0)
          if (states.length === this._broker.peers.length && states.every(state => state.updated + totalAppended)) {
            check();
          }
        });
      }

      check();
    });
  }

  async writeMetrics (fileName) {
    if (this._metricsFile !== undefined) {
      throw new Error('Already writing metrics');
    }
    this._metricsFile = await promisify(open)(fileName, 'w');

    this.on('tick', data => this.logEvent({ event: 'tick', ...data }));
    for (const [key, peer] of this._broker._peers) {
      peer.on('model-update', async ({ state }) => {
        this.logEvent({ event: 'model-update', time: new Date(), peer: key, state });
      });
    }
  }

  async logEvent (event) {
    promisify(write)(this._metricsFile, JSON.stringify(event) + '\n');
  }

  async destroy () {
    await promisify(close)(this._metricsFile);
    await this._broker.destroy();
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function compareModelStates (stateA, stateB) {
  if (stateA.length !== stateB.length) return false;
  return stateA.every(a => stateB.some(b => a.id === b.id && dequal(a, b)));
}

/**
 * @returns true if all items in the array are equal
 */
function arrayItemsEqual (arr, cmp) {
  if (arr.length <= 1) return true;
  return arr.slice(1).every(x => cmp(arr[0], x));
}
