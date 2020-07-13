//
// Copyright 2020 DXOS.org
//

const debug = require('debug');
const dequal = require('dequal');

const { Broker } = require('../');

const log = debug('dxos:spawn-testing:example');

async function run (opts = {}) {
  const maxPeers = 2;
  const maxMessagesByPeer = 10;
  const peers = [];

  const broker = new Broker();

  await broker.createSignal();
  log('> signal started');

  let partyKey = null;
  let prev = null;
  for (let i = 0; i < maxPeers; i++) {
    const peer = await broker.createPeer('TestAgent', { browser: opts.browser });
    await peer.call('init', { storage: opts.storage });
    log(`> peer${i} created`);

    if (prev === null) {
      const { publicKey } = await peer.call('createParty');
      log('> party created', publicKey.toString('hex'));
      partyKey = publicKey;
      peers.push(peer);
      prev = peer;
      continue;
    }

    const invitation = await prev.call('createInvitation', { publicKey: partyKey });
    log('> invitation created');

    await peer.call('joinParty', { invitation });
    log(`> peer${i} joined to the party`);

    peers.push(peer);
    prev = peer;
  }

  await broker.watch(peers[0], 'party-update', partyInfo => partyInfo.members.length === maxPeers);
  log('> network full connected');

  // Create models
  const type = 'example.com/Test';
  for (const peer of peers) {
    await peer.call('createObjectModel', { publicKey: partyKey, options: { type } });
  }
  log('> models created');

  // Wait for every peer receive all the messages.
  const waitForSync = Promise.all(peers.map(peer =>
    broker.watch(peer, 'model-update', ({ objectCount }) => objectCount === maxPeers * maxMessagesByPeer)));

  log('> sync started');
  console.time('sync');

  for (let i = 0; i < maxMessagesByPeer; i++) {
    for (const peer of peers) {
      await peer.call('tick');
    }
  }
  log('> finished creating items');

  await waitForSync;

  const states = await Promise.all(peers.map(peer => peer.call('dumpState')));
  const statesEqual = states.slice(1).every(state => compareModelStates(states[0], state));
  if(!statesEqual) {
    console.error('peer state mismatch')
    console.error(states)
    process.exit(-1)
  }

  log('> sync successful');
  console.timeEnd('sync');

  await broker.destroy();
}

module.exports = run;

function compareModelStates (stateA, stateB) {
  if (stateA.length !== stateB.length) return false;
  return stateA.every(a => stateB.some(b => a.id === b.id && dequal(a, b)));
}
