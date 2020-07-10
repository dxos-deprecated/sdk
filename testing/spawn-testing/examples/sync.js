//
// Copyright 2020 DXOS.org
//

const debug = require('debug');

const { Broker } = require('../');

const log = debug('dxos:spawn-testing:example');

async function run (opts = {}) {
  const { browser = false, app = 'ClientApp' } = opts;

  const maxPeers = 10;
  const maxMessagesByPeer = 1000;
  const peers = [];

  const broker = new Broker();

  await broker.createSignal();
  log('> signal started');

  let partyKey = null;
  let prev = null;
  for (let i = 0; i < maxPeers; i++) {
    const peer = await broker.createPeer(app, { browser: browser });
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

  // Create models.
  const type = 'example.com/Test';
  const tests = [];
  for (const peer of peers) {
    const { id } = await peer.call('createObjectModel', { publicKey: partyKey, options: { type } });
    tests.push({ peer, modelId: id });
  }
  log('> models created');

  // Wait for every peer receive all the messages.
  const waitForSync = Promise.all(peers.map(peer => {
    let count = 0;
    return broker.watch(peer, 'model-update', ({ messages }) => {
      count += messages.length;
      return count === maxMessagesByPeer;
    });
  }));

  log('> sync started');
  console.time('sync');

  await tests[0].peer.call('createManyItems', { modelId: tests[0].modelId, type, max: maxMessagesByPeer });
  await waitForSync;

  log('> sync successful');
  console.timeEnd('sync');

  await broker.destroy();
}

module.exports = run;
