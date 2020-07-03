//
// Copyright 2020 DXOS.
//

const { Broker } = require('./src');

const watchParty = async (client, condition) => {
  let done = false;
  while (!done) {
    const partyInfo = await client.once('party-update');
    done = condition(partyInfo);
  }
};

(async () => {
  const broker = new Broker();

  await broker.createSignal();
  console.log('> signal started');

  const peer1 = await broker.createPeer();
  console.log('> peer1 created');

  const { publicKey } = await peer1.call('createParty');
  console.log('> party created', publicKey.toString('hex'));

  const max = 3;
  let prev = peer1;
  for (let i = 0; i < max; i++) {
    const peerI = await broker.createPeer();
    console.log(`> peer${i + 1} created`);

    const invitation = await prev.call('createInvitation', { publicKey });
    console.log('> invitation created', invitation);

    await peerI.call('joinParty', { invitation });
    console.log(`> peer${i + 1} joined to the party`);
    prev = peerI;
  }

  await watchParty(peer1, partyInfo => partyInfo.members.length === max + 1);

  await broker.destroy();
})();
