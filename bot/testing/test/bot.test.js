import { MessengerModel } from '@dxos/messenger-model';

import { Orchestrator } from '../src/orchestrator';

jest.setTimeout(100 * 1000);

test('bot test', async () => {
  const orchestrator = new Orchestrator();

  orchestrator.client.registerModel(MessengerModel);

  await orchestrator.start();

  // Path related to cwd.
  const agent = await orchestrator.startAgent('./test/test-agent.js');

  await orchestrator.party.database.createItem({ model: MessengerModel, type: 'dxos.org/type/testing/object' });

  await agent.sendCommand({ type: 'append' });
  await agent.sendCommand({ type: 'append' });

  const messages = await agent.sendCommand({ type: 'get-all' });

  expect(messages).toHaveLength(2);

  console.log(messages);

  await orchestrator.destroy();
});
