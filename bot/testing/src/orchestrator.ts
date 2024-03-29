//
// Copyright 2020 DXOS.org
//

import { spawn, ChildProcess } from 'child_process';
import debug from 'debug';
import path from 'path';
import ram from 'random-access-memory';
import kill from 'tree-kill';

import { runWithTimeout } from '@dxos/async';
import { BotFactoryClient } from '@dxos/botkit-client';
import { Client } from '@dxos/client';
import { SIGNATURE_LENGTH, keyToBuffer, createKeyPair, keyToString, verify, sha256 } from '@dxos/crypto';

import { Agent } from './agent';
import { CONFIG, FACTORY_OUT_DIR } from './config';
import { buildAndPublishBot } from './distributor';
import { Party } from '@dxos/echo-db';
import assert from 'assert';

import { SpawnOptions } from '@dxos/protocol-plugin-bot';
import { Invitation } from '@dxos/credentials';

const log = debug('dxos:testing');

const ORCHESTRATOR_NAME = 'Test';

const FACTORY_START_TIMEOUT = 5 * 1000;

export const NODE_ENV = 'node';
export const BROWSER_ENV = 'browser';

// Get Id information of bot.
// Important: this regulates how often bot gets downloaded from ipfs.
const testTime = Date.now();
const getBotIdentifiers = (botPath: string, env: string | undefined) => {
  const name = `wrn://dxos/bot/${env}/${path.basename(botPath)}`;
  const id = sha256(`${name}${testTime}`);
  return {
    id,
    name
  };
};

export class Orchestrator {
  _builds = new Map();
  _client: Client;
  _localRun: boolean;
  _party: Party;
  _factoryClient: BotFactoryClient;
  _factory: any;

  constructor (options: {local: boolean}) {
    const { local = true } = options;
    this._client = new Client({
      storage: ram,
      // TODO(egorgripasov): Factor out (use main config).
      swarm: {
        signal: CONFIG.WIRE_SIGNAL_ENDPOINT,
        ice: JSON.parse(CONFIG.WIRE_ICE_ENDPOINTS)
      }
    });
    this._localRun = local;
  }

  async start () {
    await this._client.initialize();

    const { publicKey, secretKey } = createKeyPair();
    const username = ORCHESTRATOR_NAME;

    await this._client.createProfile({ publicKey, secretKey, username });

    // Create control party.
    this._party = await this._client.echo.createParty();

    // Start BotFactory.
    // TODO(egorgripasov): Generally, we might want to use a set of already running factories.
    // This could be turned into the list as well;
    this._factory = await this._startBotFactory();
    this._factoryClient = new BotFactoryClient(this._client.networkManager, this._factory.topic);
  }

  get client () {
    return this._client;
  }

  get party () {
    return this._party;
  }

  get botFactoryPid () {
    return this._factory.process.pid;
  }

  async startAgent (options: SpawnOptions) {
    const { env = NODE_ENV, botPath, ...rest } = options;
    
    assert(botPath);
    if (this._localRun) {
      options = {
        ...rest,
        botPath
      };
    } else {
      const buildId = `${botPath}-${env}`;
      let ipfsCID = this._builds.get(buildId);
      if (!ipfsCID) {
        log('Building & publishing bot package...');
        ipfsCID = await buildAndPublishBot(CONFIG.WIRE_IPFS_GATEWAY, botPath, env === 'browser');
        this._builds.set(buildId, ipfsCID);
      }
      options = {
        ...rest,
        env,
        ipfsCID,
        ipfsEndpoint: CONFIG.WIRE_IPFS_GATEWAY
      };
    }

    log('Sending spawn bot command...');
    const botId = await this._spawnBot(botPath, options);

    assert(botId);
    await this._inviteBot(botId);

    return new Agent(this._factoryClient, botId);
  }

  async destroy () {
    kill(this._factory.process.pid, 'SIGKILL');
    await this._factoryClient.close();
    // TODO(egorgripasov): Produced feed store errors.
    // await this._client.destroy();
  }

  async _startBotFactory (): Promise<{ topic: string, process: ChildProcess }> {
    return runWithTimeout(async () => {
      const { publicKey, secretKey } = createKeyPair();
  
      const topic = keyToString(publicKey);

      const env = {
        ...process.env,
        NODE_OPTIONS: '',
        ...CONFIG,
        DEBUG: `bot-factory,bot-factory:*,dxos:botkit*,dxos:testing*,${process.env.DEBUG}`,
        WIRE_BOT_RESET: 'true',
        WIRE_BOT_TOPIC: topic,
        WIRE_BOT_SECRET_KEY: keyToString(secretKey),
        WIRE_BOT_LOCAL_DEV: this._localRun.toString(),
        WIRE_BOT_DUMP_FILE: path.join(FACTORY_OUT_DIR, topic)
      };

      const factory = spawn('node', [path.join(__dirname, './bot-factory.js')], { env });

      factory.stderr.pipe(process.stderr);
      factory.stdout.pipe(process.stdout);

      await new Promise(resolve => {
        factory.stdout.on('data', (data: Buffer) => {
          if (/"started":true/.test(data.toString())) {
            log('Bot Factory started.');
            resolve();
          }
        });
      });;

      return {
        topic,
        process: factory
      }
    }, FACTORY_START_TIMEOUT, new Error(`Failed to start bot factory: Timed out in ${FACTORY_START_TIMEOUT} ms.`))
  }

  async _spawnBot (botPath: string, options: SpawnOptions) {
    const { env } = options;
    const botId = await this._factoryClient.sendSpawnRequest(undefined, {
      ...getBotIdentifiers(botPath, env),
      ...options
    });

    log(`Test Bot ${botId} spawned.`);

    return botId;
  }

  // TODO(egorgripasov): Takes non-defined time; wait for node to appear in control party?
  async _inviteBot (botId: string) {
    const secretValidator = async (invitation: Invitation, secret: Buffer) => {
      const signature = secret.slice(0, SIGNATURE_LENGTH);
      const message = secret.slice(SIGNATURE_LENGTH);
      return verify(message, signature, keyToBuffer(this._factory.topic));
    };

    const invitation = await this._party.createInvitation({ secretValidator });

    await this._factoryClient.sendInvitationRequest(botId, this._party.key.toHex(), {}, invitation.toQueryParameters());

    log(`Bot ${botId} invited.`);
  }
}
