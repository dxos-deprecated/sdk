import { Orchestrator } from '../src/orchestrator';
import { ObjectModel } from '@dxos/object-model';

jest.setTimeout(100 * 1000);

test('bot test', async () => {
  const orchestrator = new Orchestrator();

  await orchestrator.start();

  await orchestrator.party.database.createItem({ model: ObjectModel, type: 'dxos.org/type/testing/object', props: { count: 0 } })

  const agent = await orchestrator.startAgent();

  await agent.sendCommand({ type: 'append' });
  await agent.sendCommand({ type: 'append' });

  const result = await agent.sendCommand({ type: 'get-all' });

  const { count } = JSON.parse(result);

  expect(count).toBe(2);

  await orchestrator.destroy();
});
