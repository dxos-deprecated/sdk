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

  const client1 = await broker.createPeer();
  const client2 = await broker.createPeer();

  const { publicKey } = await client1.call('createParty');

  const invitation = await client1.call('createInvitation', { publicKey });

  await client2.call('joinParty', { invitation });

  await watchParty(client1, partyInfo => partyInfo.members.length === 2);

  await broker.destroy();
})();
