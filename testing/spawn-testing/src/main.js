//
// Copyright 2020 DXOS.org
//

const debug = require('debug');
const dequal = require('dequal');
const mri = require('mri');

const { Broker } = require('./broker');

const log = debug('dxos:spawn-testing:example');

async function run (opts = {}) {
  const maxPeers = opts.peers || 2;
  const maxTicks = opts.ticks || 1;

  const broker = new Broker();

  await broker.createSignal();
  log('> signal started');

  let partyKey = null;
  let prev = null;
  for (let i = 0; i < maxPeers; i++) {
    const peer = await broker.createPeer({
      agent: opts.agent,
      storage: opts.storage,
      browser: opts.browser
    });
    log(`> peer${i} created`);

    if (prev === null) {
      const { publicKey } = await peer.call('createParty');
      log('> party created', publicKey.toString('hex'));
      partyKey = publicKey;
      prev = peer;
    } else {
      const invitation = await prev.call('createInvitation', { publicKey: partyKey });
      log('> invitation created');

      await peer.call('joinParty', { invitation });
      log(`> peer${i} joined to the party`);

      prev = peer;
    }
  }

  await broker.watch(broker.peers[0], 'party-update', partyInfo => partyInfo.members.length === maxPeers);
  log('> network full connected');

  // Init agents
  for (const peer of broker.peers) {
    await peer.call('initAgent');
  }
  log('> agents initialized');

  log('> sync started');
  console.time('sync');

  for (let i = 0; i < maxTicks; i++) {
    for (const peer of broker.peers) {
      await peer.call('tick');
    }
  }
  log('> finished creating items');

  // waiting for sync
  await new Promise(resolve => {
    async function check() {
      const modelObjects = await Promise.all(broker.peers.map(peer => peer.call('getModelObjects')));
      const statesEqual = arrayItemsEqual(modelObjects, compareModelStates);
      if(statesEqual && modelObjects[0].length !== 0) {
        resolve();
      }
    }

    const peerStates = new Map()
    for(const [key, peer] of broker._peers) {
      peer.on('model-update', async ({ state }) => {
        peerStates.set(key, state)
        const states = Array.from(peerStates.values());
        if(states.length === broker.peers.length && arrayItemsEqual(states, (a, b) => a.objectCount === b.objectCount)) {
          check();
        }
      })
    }

    check();
  })

  const modelObjects = await Promise.all(broker.peers.map(peer => peer.call('getModelObjects')));
  const statesEqual = arrayItemsEqual(modelObjects, compareModelStates);
  if (!statesEqual) {
    log('> state mismatch');
    process.exit(-1);
  }

  log('> sync successful');
  console.timeEnd('sync');

  await broker.destroy();
}

function compareModelStates (stateA, stateB) {
  if (stateA.length !== stateB.length) return false;
  return stateA.every(a => stateB.some(b => a.id === b.id && dequal(a, b)));
}

/**
 * @returns true if all items in the array are equal
 */
function arrayItemsEqual(arr, cmp) {
  if(arr.length <= 1) return true
  return arr.slice(1).every(x => cmp(arr[0], x))
} 

run(mri(process.argv.slice(2)));
