import { FeedStore } from '@dxos/feed-store'
import { NetworkManager, SwarmProvider, transportProtocolProvider } from '@dxos/network-manager'
import { createStorage } from '@dxos/random-access-multi-storage';
import {BotPlugin} from './bot';
import { randomBytes } from '@dxos/crypto';
import debug from 'debug'

const log = debug('dxos:protocol-plugin-bot:test')

test('many bots connected to control topic', async () => {
  const createPeer = (controlTopic: Buffer, peerId: Buffer) => {
    const feedStore = new FeedStore(createStorage('test', 'ram'));
    // TODO(marik-d): Why is feed-store required here?
    const networkManager = new NetworkManager(feedStore, new SwarmProvider({
      signal: 'wss://apollo2.kube.moon.dxos.network/dxos/signal',
      ice: [{"urls":"stun:apollo1.kube.moon.dxos.network:3478"},{"urls":"turn:apollo1.kube.moon.dxos.network:3478","username":"dxos","credential":"dxos"},{"urls":"stun:apollo2.kube.moon.dxos.network:3478"},{"urls":"turn:apollo2.kube.moon.dxos.network:3478","username":"dxos","credential":"dxos"}],
    }));
  
    const plugin = new BotPlugin(peerId, (protocol, message) => {});
    networkManager.joinProtocolSwarm(controlTopic, transportProtocolProvider(controlTopic, controlTopic, plugin));

    return plugin;
  }

  const controlTopic = randomBytes();
  const controlPeer = createPeer(controlTopic, controlTopic);
  for(let i = 0; i < 15; i++) {
    const peer = createPeer(controlTopic, randomBytes());
    const before = Date.now();
    await peer.waitForConnection(controlTopic);
    log(`Peer #${i} took ${Date.now() - before} ms to connect`)
  }
}, 60_000)
