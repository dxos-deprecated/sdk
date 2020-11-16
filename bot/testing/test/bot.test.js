import { MessengerModel } from '@dxos/messenger-model';

import { NODE_ENV, Orchestrator } from '../src/orchestrator';

jest.setTimeout(100 * 1000);

test.skip('bot test - local source', async () => {
  const orchestrator = new Orchestrator({ local: true });

  orchestrator.client.registerModel(MessengerModel);

  await orchestrator.start();

  const agent = await orchestrator.startAgent({ botPath: './src/test-agent.js' });

  await orchestrator.party.database.createItem({ model: MessengerModel, type: 'dxos.org/type/testing/object' });

  await agent.sendCommand({ type: 'append' });
  await agent.sendCommand({ type: 'append' });

  const messages = await agent.sendCommand({ type: 'get-all' });

  expect(messages).toHaveLength(2);

  console.log(messages);

  await orchestrator.destroy();
});

test('bot test - remote source', async () => {
  const orchestrator = new Orchestrator({ local: false });

  orchestrator.client.registerModel(MessengerModel);

  await orchestrator.start();

  await orchestrator.startAgent({ botPath: './src/test-agent.js', env: NODE_ENV });

  await orchestrator.destroy();
});
