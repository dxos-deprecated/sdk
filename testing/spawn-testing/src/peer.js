//
// Copyright 2020 DXOS.org
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
        init: (opts) => app.init(opts),
        createParty: () => app.createParty(),
        createInvitation: ({ publicKey }) => app.createInvitation(publicKey),
        joinParty: ({ invitation }) => app.joinParty(invitation),
        createObjectModel: ({ publicKey, options }) => app.createObjectModel(publicKey, options),
        initAgent: ({ publicKey }) => app.initAgent(publicKey),
        createItem: ({ modelId, type, properties }) => app.createItem(modelId, type, properties),
        createManyItems: ({ modelId, type, max }) => app.createManyItems(modelId, type, max),
        tick: () => app.tick(),
        dumpState: () => app.dumpState(),
        exit: () => process.exit(0),
      })
      .open();

    app.on('party-update', (partyInfo) => {
      rpc.emit('party-update', partyInfo);
    });

    app.on('model-update', data => {
      rpc.emit('model-update', data);
    });

    rpc.emit('app-ready', ({ publicKey: app.identityPublicKey }));
  } catch (err) {
    console.log(err);
  }
})();
