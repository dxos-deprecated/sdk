import { Orchestrator } from '../src/orchestrator';
import { MessengerModel } from '@dxos/messenger-model';

jest.setTimeout(100 * 1000);

test('bot test', async () => {
  const orchestrator = new Orchestrator();

  await orchestrator.start();

  await orchestrator.party.database.createItem({ model: MessengerModel, type: 'dxos.org/type/testing/object', props: { count: 0 } });

  const agent = await orchestrator.startAgent();

  await agent.sendCommand({ type: 'append' });
  await agent.sendCommand({ type: 'append' });

  const messages = await agent.sendCommand({ type: 'get-all' });

  expect(messages).toHaveLength(2);

  console.log(messages);

  await orchestrator.destroy();
});
