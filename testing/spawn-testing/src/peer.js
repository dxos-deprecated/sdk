//
// Copyright 2020 DXOS.
//

import mri from 'mri';
import * as apps from './test-app';
import { createRPC } from './create-rpc';

(async () => {
  try {
    const options = mri(process.argv.slice(2));

    const rpc = createRPC(typeof window !== 'undefined' && window.process ? window.process : process);

    const ClassApp = options.typeApp ? apps[options.typeApp] : apps.ClientApp;

    const app = new ClassApp();

    await rpc
      .actions({
        ping: () => 'pong',
        createParty: () => app.createParty(),
        createInvitation: ({ publicKey }) => app.createInvitation(publicKey),
        joinParty: ({ invitation }) => app.joinParty(invitation),
        createObjectModel: ({ publicKey, options }) => app.createObjectModel(publicKey, options),
        createItem: ({ modelId, type, properties }) => app.createItem(modelId, type, properties),
        createManyItems: ({ modelId, type, max }) => app.createManyItems(modelId, type, max)
      })
      .open();

    app.on('party-update', (partyInfo) => {
      rpc.emit('party-update', partyInfo);
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
