//
// Copyright 2020 DXOS.
//

import { TestApp } from './test-app';
import { createRPC } from './create-rpc';

(async () => {
  try {
    const rpc = createRPC(process);

    const app = new TestApp();

    await rpc
      .actions({
        createParty: () => app.createParty(),
        createInvitation: ({ publicKey }) => app.createInvitation(publicKey),
        joinParty: ({ invitation }) => app.joinParty(invitation),
        createObjectModel: ({ publicKey, options }) => app.createObjectModel(publicKey, options),
        createItem: ({ modelId, type, properties }) => app.createItem(modelId, type, properties)
      })
      .open();

    app.on('party-update', (partyInfo) => {
      const members = partyInfo.members.map(m => ({
        publicKey: m.publicKey,
        displayName: m.displayName
      }));
      rpc.emit('party-update', { publicKey: partyInfo.publicKey, members });
    });

    app.on('model-update', data => {
      rpc.emit('model-update', data);
    });

    await app.open();

    rpc.emit('app-ready', ({ publicKey: app.identityPublicKey }));
  } catch (err) {
    console.log(err);
  }
})();
