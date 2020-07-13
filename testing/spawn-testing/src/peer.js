//
// Copyright 2020 DXOS.org
//

import mri from 'mri';
import hrtime from 'browser-process-hrtime';
import prettyHrtime from 'pretty-hrtime';

import { getModelDescriptor } from './agents';
import TestAgent from './agents/test-agent';
import { createRPC } from './create-rpc';

(async () => {
  try {
    const options = mri(process.argv.slice(2));

    const rpc = createRPC(typeof window !== 'undefined' && window.process ? window.process : process);

    const errors = [];
    process.on('unhandledRejection', (err) => {
      errors.push(err);
    });

    process.on('uncaughtException', (err) => {
      errors.push(err);
    });

    const app = options.agent ? require(options.agent) : new TestAgent();

    const startTime = hrtime();

    await rpc
      .actions({
        ping: () => 'pong',
        init: (opts) => app.init(opts),
        createParty: () => app.createParty(),
        createInvitation: ({ publicKey }) => app.createInvitation(publicKey),
        joinParty: ({ invitation }) => app.joinParty(invitation),
        createObjectModel: async ({ publicKey, options }) => {
          const model = await app.createObjectModel(publicKey, { options });
          return getModelDescriptor(model).id;
        },
        tick: () => app.tick(),
        getState: () => {
          const state = app.state;

          const liveTime = hrtime(startTime);

          return {
            liveTimeFormat: `~${prettyHrtime(liveTime)} (${liveTime[0]} s + ${liveTime[1]} ns)`,
            liveTime,
            app: state,
            unhandledErrors: errors
          };
        }
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
