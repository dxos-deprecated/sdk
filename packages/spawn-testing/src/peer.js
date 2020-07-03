//
// Copyright 2020 DXOS.
//

const Client = require('./client');
const createRPC = require('./create-rpc');

(async () => {
  try {
    console.log(process.send)
    const rpc = createRPC(process);

    const client = new Client();

    await rpc
      .action('createParty', () => {
        return client.createParty();
      })
      .action('createInvitation', ({ publicKey }) => {
        return client.createInvitation(publicKey);
      })
      .action('joinParty', async ({ invitation }) => {
        await client.joinParty(invitation);
      })
      .open();

    client.on('party-update', (partyInfo) => {
      const members = partyInfo.members.map(m => ({
        publicKey: m.publicKey,
        displayName: m.displayName
      }));
      rpc.emit('party-update', { publicKey: partyInfo.publicKey, members });
    });

    await client.open();

    rpc.emit('ready', ({ publicKey: client.publicKey }));
  } catch (err) {
    console.log(err);
  }
})();
