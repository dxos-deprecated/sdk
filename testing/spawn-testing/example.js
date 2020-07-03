//
// Copyright 2020 DXOS.
//

const { Broker } = require('./');

const watch = async (client, event, condition) => {
  for await (const result of client.events(event)) {
    if (condition(result)) {
      break;
    }
  }
};

(async () => {
  const maxPeers = 2;
  const maxMessagesByPeer = 1000;
  const peers = [];

  const broker = new Broker();

  await broker.createSignal();
  console.log('> signal started');

  let partyKey = null;
  let prev = null;
  for (let i = 0; i < maxPeers; i++) {
    const peer = await broker.createPeer();
    console.log(`> peer${i} created`);

    if (prev === null) {
      const { publicKey } = await peer.call('createParty');
      console.log('> party created', publicKey.toString('hex'));
      partyKey = publicKey;
      peers.push(peer);
      prev = peer;
      continue;
    }

    const invitation = await prev.call('createInvitation', { publicKey: partyKey });
    console.log('> invitation created');

    await peer.call('joinParty', { invitation });
    console.log(`> peer${i} joined to the party`);

    peers.push(peer);
    prev = peer;
  }

  await watch(peers[0], 'party-update', partyInfo => partyInfo.members.length === maxPeers);
  console.log('> network full connected');

  // create models
  const type = 'example.com/Test';
  const models = [];
  for (const peer of peers) {
    const { id } = await peer.call('createObjectModel', { publicKey: partyKey, options: { type } });
    models.push({ peer, modelId: id });
  }
  console.log('> models created');

  // wait for every peer receive all the messages
  const waitForSync = Promise.all(peers.map(peer => {
    let count = 0;
    return watch(peer, 'model-update', ({ messages }) => {
      count += messages.length;
      return count === maxMessagesByPeer * peers.length;
    });
  }));

  // create 1000 items in every peer
  for (const { peer, modelId } of models) {
    await peer.call('createManyItems', { modelId, type, max: maxMessagesByPeer });
  }

  await waitForSync;
  console.log('> sync successful');

  await broker.destroy();
})();
