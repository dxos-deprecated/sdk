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

  const peer2 = await broker.createPeer();
  console.log('> peer2 created');

  const { publicKey } = await peer1.call('createParty');
  console.log('> party created', publicKey.toString('hex'));

  const invitation = await peer1.call('createInvitation', { publicKey });
  console.log('> invitation created', invitation);

  await peer2.call('joinParty', { invitation });

  await watchParty(peer1, partyInfo => partyInfo.members.length === 2);
  console.log('> peer2 joined to the party');

  await broker.destroy();
})();
