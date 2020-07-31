//
// Copyright 2020 DXOS.org
//

const debug = require('debug');
const mri = require('mri');
const { basename } = require('path');

const { Environment } = require('../environment');

const log = debug('dxos:spawn-testing:example');

async function run ({ readers = 1, messages = 1_000, repeatRuns = 3, ...opts } = {}) {
  const environment = new Environment();
  await environment.start();
  await environment.addPeers(opts);

  await environment.addPeers({
    ...opts,
    count: readers,
    agent: './src/agents/reading-agent.js'
  });

  log('> network full connected');

  log('> sync started');
  console.time('sync');

  await environment.writeMetrics(`./metrics-${basename(__filename)}.log`);

  async function measureCatchUpTime (throughput) {
    const batchSize = 100;
    const ticks = Math.ceil(messages / batchSize);
    const timePerTick = 1000 / throughput * batchSize;
    const startTime = Date.now();
    for (let i = 0; i < ticks; i++) {
      const nextTickTime = startTime + (i + 1) * timePerTick;
      await environment.runTicks({ count: 1, delay: Math.max(0, nextTickTime - Date.now()) });
    }
    log('> finished creating items');

    await environment.waitForSync();
    return Date.now() - startTime - timePerTick * ticks;
  }

  for (let throughput = 400; throughput < 2000; throughput += 100) {
    console.log(`Starting tests with ${throughput} msg/sec`);
    for (let run = 0; run < repeatRuns; run++) {
      const catchUpTime = await measureCatchUpTime(throughput);
      console.log(`${throughput}msg/sec - ${Math.round(catchUpTime / 1000)}s catch-up`);
      environment.logEvent({ throughput, catchUpTime });
    }
  }

  if (!await environment.comparePeerStates()) {
    log('> state mismatch');
    process.exit(-1);
  }

  log('> sync successful');
  console.timeEnd('sync');

  await environment.destroy();
}

run(mri(process.argv.slice(2)));