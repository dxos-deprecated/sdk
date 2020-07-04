//
// Copyright 2020 DXOS.
//
const debug = require('debug');
const { Broker } = require('./');

const log = debug('spawn-testing:example');

const watch = async (client, event, condition) => {
  for await (const result of client.events(event)) {
    if (condition(result)) {
      break;
    }
  }
};

(async () => {
  const maxPeers = 10;
  const maxMessagesByPeer = 100;
  const peers = [];

  const broker = new Broker();

  await broker.createSignal();
  log('> signal started');

  let partyKey = null;
  let prev = null;
  for (let i = 0; i < maxPeers; i++) {
    const peer = await broker.createPeer('BasicApp');
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

  await watch(peers[0], 'party-update', partyInfo => partyInfo.members.length === maxPeers);
  log('> network full connected');

  // create models
  const type = 'example.com/Test';
  const models = [];
  for (const peer of peers) {
    const { id } = await peer.call('createObjectModel', { publicKey: partyKey, options: { type } });
    models.push({ peer, modelId: id });
  }
  log('> models created');

  // wait for every peer receive all the messages
  const waitForSync = Promise.all(peers.map(peer => {
    let count = 0;
    return watch(peer, 'model-update', ({ messages }) => {
      count += messages.length;
      return count === maxMessagesByPeer * peers.length;
    });
  }));

  log('> sync started');

  console.time('sync');
  // create 1000 items in every peer
  for (const { peer, modelId } of models) {
    await peer.call('createManyItems', { modelId, type, max: maxMessagesByPeer });
  }

  await waitForSync;

  log('> sync successful');
  console.timeEnd('sync');

  await broker.destroy();
})();
