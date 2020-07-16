//
// Copyright 2020 DXOS.org
//

import hrtime from 'browser-process-hrtime';
import prettyHrtime from 'pretty-hrtime';

import AgentClass from './agents';
import { createRPC } from './create-rpc';

(async () => {
  try {
    const rpc = createRPC(typeof window !== 'undefined' && window.process ? window.process : process);

    const errors = [];
    process.on('unhandledRejection', (err) => {
      errors.push(err);
    });

    process.on('uncaughtException', (err) => {
      errors.push(err);
    });

    const agent = new AgentClass();

    const startTime = hrtime();

    await rpc
      .actions({
        ping: () => 'pong',
        init: async (opts) => {
          await agent.init(opts);
          return { publicKey: agent.identityPublicKey };
        },
        createParty: () => agent.createParty(),
        createInvitation: ({ publicKey }) => agent.createInvitation(publicKey),
        joinParty: ({ invitation }) => agent.joinParty(invitation),
        initAgent: () => agent.initAgent(),
        getModelObjects: () => agent.getModelObjects(),
        tick: () => agent.tick(),
        getState: () => {
          const state = agent.state;

          const liveTime = hrtime(startTime);

          return {
            liveTimeFormat: `~${prettyHrtime(liveTime)} (${liveTime[0]} s + ${liveTime[1]} ns)`,
            liveTime,
            agent: state,
            unhandledErrors: errors
          };
        }
      })
      .open();

    agent.on('party-update', (partyInfo) => {
      rpc.emit('party-update', partyInfo);
    });

    agent.on('model-update', data => {
      rpc.emit('model-update', data);
    });

    rpc.emit('agent-ready');
  } catch (err) {
    console.log(err);
  }
})();
