//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import assert from 'assert';
import fs, { ensureFileSync } from 'fs-extra';
import watch from 'node-watch';
import path from 'path';
import { spawn } from 'child_process';
import moment from 'moment';
import kill from 'tree-kill';
import yaml from 'js-yaml';
import { Chance } from 'chance';
import get from 'lodash.get';

import { keyToString, createKeyPair } from '@dxos/crypto';
import { Registry } from '@wirelineio/registry-client';

import { log, logBot } from './log';
import { NATIVE_ENV, SourceManager, getBotCID } from './source-manager';
import { BOT_CONFIG_FILENAME } from './config';

const chance = new Chance();

const logInfo = debug('dxos:botkit');

// File where information about running bots is stored.
export const BOTS_DUMP_FILE = 'out/factory-state';

// Directory inside BOT_PACKAGE_DOWNLOAD_DIR/<CID> in which bots are spawned, in their own UUID named subdirectory.
export const SPAWNED_BOTS_DIR = '.bots';

export class BotManager {
  /**
   * @type {Map<String, {botUID: String, process: Process, type: String, parties: Array, timeState: Object, command: String, args: Array, watcher: Object, stopped: Boolean, name: String}>}
   */
  _bots = new Map();

  constructor (config, { ipcServerId, ipcServerPort }) {
    this._config = config;
    this._ipcServerId = ipcServerId;
    this._ipcServerPort = ipcServerPort;

    this._localDev = this._config.get('bot.localDev');
    this._botsFile = path.join(process.cwd(), BOTS_DUMP_FILE);

    this._registry = new Registry(this._config.get('services.wns.server'), this._config.get('services.wns.chainId'));
    this._sourceManager = new SourceManager(config);

    ensureFileSync(this._botsFile);
  }

  async start () {
    await this._readBotsFromFile();

    const reset = this._config.get('bot.reset');
    if (reset) {
      await this.killAllBots();
    } else {
      for await (const { botUID, stopped } of this._bots.values()) {
        if (!stopped) {
          await this._startBot(botUID);
        }
      }
    }
  }

  /**
   * Spawn bot instance.
   * @param {String} botId
   * @param {Object} options
   */
  async spawnBot (botId, options = {}) {
    let { ipfsCID, env = NATIVE_ENV, name: displayName, id } = options;
    assert(botId || ipfsCID);

    log(`Spawn bot request for ${botId || ipfsCID}`);

    if (!ipfsCID) {
      const botRecord = await this._getBotRecord(botId);
      if (!this._localDev) {
        ipfsCID = getBotCID(botRecord, env);
      }

      if (!displayName) {
        displayName = get(botRecord, 'attributes.name');
      }

      if (!id) {
        id = get(botRecord, 'id');
      }
    }

    assert(id, 'Invalid Bot Id.');
    assert(displayName, 'Invalid Bot Name.');

    const botPathInfo = await this._sourceManager.getBotPathInfo(id, ipfsCID, env, options);
    assert(botPathInfo, `Invalid bot: ${botId || ipfsCID}`);

    const botUID = keyToString(createKeyPair().publicKey);
    const name = `bot:${displayName} ${chance.animal()}`;

    const childDir = path.join(botPathInfo.installDirectory, SPAWNED_BOTS_DIR, botUID);
    await fs.ensureDir(childDir);

    const { command, args } = this._sourceManager.getCommand(botPathInfo, env);
    return this._startBot(botUID, { childDir, botId, command, args, name, env });
  }

  /**
   * @param {String} botUID Unique Bot ID.
   */
  async stopBot (botUID) {
    this._stopBot(botUID, true);
  }

  /**
   * @param {String} botUID Unique Bot ID.
   */
  async killBot (botUID) {
    const botInfo = this._bots.get(botUID);
    assert(botInfo, 'Invalid Bot UID');

    this._stopBot(botUID);
    this._bots.delete(botUID);
    await this._saveBotsToFile();

    const { childDir } = botInfo;

    await fs.remove(childDir);
    log(`Bot '${botUID}' removed from Bot Container.`);
  }

  async killAllBots () {
    for await (const { process, watcher, childDir } of this._bots.values()) {
      if (process) {
        kill(process.pid, 'SIGKILL');
      }
      if (watcher) {
        watcher.close();
      }
      if (childDir) {
        await fs.remove(childDir);
      }
    }
    this._bots.clear();
    await this._saveBotsToFile();
  }

  /**
   * @param {String} botUID Unique Bot ID.
   */
  async restartBot (botUID) {
    this._stopBot(botUID);
    await this._startBot(botUID);
  }

  async restartBots () {
    for await (const { botUID } of this._bots.values()) {
      await this.restartBot(botUID);
    }
  }

  /**
   * @param {String} botUID Unique Bot ID.
   */
  async startBot (botUID) {
    const botInfo = this._bots.get(botUID);

    assert(botInfo, 'Invalid Bot UID');
    assert(botInfo.stopped, `Bot ${botUID} already running`);
    await this._startBot(botUID);
  }

  /**
   * @param {String} botUID Unique Bot ID.
   * @param {String} topic Party to join.
   */
  async addParty (botUID, topic) {
    const botInfo = this._bots.get(botUID);

    assert(botInfo, 'Invalid Bot UID');
    if (botInfo.parties.indexOf(topic) === -1) {
      botInfo.parties.push(topic);
    }
    await this._saveBotsToFile();
  }

  async getStatus () {
    return [...this._bots.values()].map(({ timeState, ...rest }) => ({
      ...rest,
      started: timeState ? timeState.started.format() : null,
      lastActive: timeState ? timeState.lastActive.format() : null
    }));
  }

  stop () {
    for (const { botUID } of this._bots.values()) {
      this._stopBot(botUID);
    }
  }

  /**
   * Start bot instance.
   * @param {String} botUID
   * @param {Object} options
   */
  async _startBot (botUID, options = {}) {
    const botInfo = this._bots.get(botUID);

    let { childDir, command, args, name } = options; // || botInfo;
    if (botInfo) {
      command = botInfo.command;
      args = botInfo.args;
      childDir = botInfo.childDir;
      name = botInfo.name;
    }

    const wireEnv = {
      WIRE_BOT_IPC_SERVER: this._ipcServerId,
      WIRE_IPC_PORT: this._ipcServerPort,
      WIRE_BOT_UID: botUID,
      WIRE_BOT_NAME: name,
      WIRE_BOT_CWD: childDir,
      WIRE_BOT_RESTARTED: !!botInfo
    };

    const childOptions = {
      env: {
        ...process.env,
        NODE_OPTIONS: '',
        // TODO(egorgripasov): For node.js env - fix.
        // $ export NODE_PATH=$(yarn global dir)/node_modules
        // # or node
        // $ export NODE_PATH=$(npm root --quiet -g)
        NODE_PATH: '/Users/egorgripasov/.config/yarn/global/node_modules',
        ...wireEnv
      },

      cwd: childDir,

      // https://nodejs.org/api/child_process.html#child_process_options_detached
      detached: false
    };

    const botProcess = spawn(command, args, childOptions);

    const timeState = {
      started: moment.utc(),
      lastActive: moment.utc()
    };

    const watcher = watch(childDir, { recursive: true }, () => {
      timeState.lastActive = moment.utc();
    });

    if (botInfo) {
      // Restart.
      Object.assign(botInfo, {
        process: botProcess,
        timeState,
        watcher,
        stopped: false
      });
    } else {
      // New instance.
      this._bots.set(botUID, {
        botUID,
        childDir,
        process: botProcess,
        type: options.botId,
        parties: [],
        timeState,
        command,
        args,
        watcher,
        stopped: false,
        name
      });
    }
    await this._saveBotsToFile();

    log(`Spawned bot: ${JSON.stringify({ pid: botProcess.pid, command, args, wireEnv, cwd: childDir })}`);

    botProcess.stdout.on('data', (data) => {
      logBot[botProcess.pid](`${data}`);
    });

    botProcess.stderr.on('data', (data) => {
      logBot[botProcess.pid](`${data}`);
    });

    botProcess.on('close', async (code) => {
      const botInfo = this._bots.get(botUID);
      if (!code && botInfo) {
        botInfo.stopped = true;
        await this._saveBotsToFile();
      }
      log(`Bot pid: ${botProcess.pid} exited with code ${code}.`);
    });

    botProcess.on('error', (err) => {
      logBot[botProcess.pid](`Error: ${err}`);
    });

    return botUID;
  }

  /**
   * @param {String} botUID Unique Bot UID
   * @param {Boolean} stopped Whether bot should be marked as stopped
   */
  _stopBot (botUID, stopped = false) {
    const botInfo = this._bots.get(botUID);
    assert(botInfo, 'Invalid Bot UID');

    const { process, watcher } = botInfo;

    if (process && process.pid) {
      kill(process.pid, 'SIGKILL');
    }
    if (watcher) {
      watcher.close();
    }

    if (stopped) {
      botInfo.stopped = true;
    }
    log(`Bot '${botUID}' stopped.`);
  }

  async _saveBotsToFile () {
    const data = [...this._bots.values()].map(({ botUID, type, childDir, parties, command, args, stopped, name }) => ({
      botUID,
      type,
      name,
      childDir,
      parties,
      command,
      args,
      stopped
    }));
    await fs.writeJSON(this._botsFile, data);
  }

  async _readBotsFromFile () {
    assert(this._bots.size === 0, 'Bots already initialized.');

    let data = [];
    try {
      data = await fs.readJson(this._botsFile);
    } catch (err) {
      logInfo(err);
    }
    data.forEach(({ botUID, ...rest }) => {
      this._bots.set(botUID, { botUID, ...rest });
    });
  }

  async _getBotRecord (botId) {
    if (this._localDev) {
      const botInfo = yaml.load(
        await fs.readFile(path.join(process.cwd(), BOT_CONFIG_FILENAME))
      );
      return { attributes: { displayName: botInfo.name }, id: botInfo.id };
    }
    const { records } = await this._registry.resolveNames([botId]);
    if (!records.length) {
      log(`Bot not found: ${botId}.`);
      throw new Error(`Invalid bot: ${botId}`);
    }
    return records[0];
  }
}
