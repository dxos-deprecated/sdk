//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import { spawn, SpawnOptions } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import moment from 'moment';
import watch from 'node-watch';
import path from 'path';
import kill from 'tree-kill';

import { keyToString } from '@dxos/crypto';

import { BotInfo } from '../bot-manager';
import { log, logBot } from '../log';
import { NATIVE_ENV, SourceManager, removeSourceFiles, LOCAL_BOT_MAIN_FILE } from '../source-manager';
import { BotAttributes, BotContainer } from './intefrace';

// Directory inside BOT_PACKAGE_DOWNLOAD_DIR/<CID> in which bots are spawned, in their own UUID named subdirectory.
export const SPAWNED_BOTS_DIR = '.bots';

// Command to spawn to run a bot in local development mode.
export const LOCAL_BOT_RUN_COMMAND = 'yarn';

// Fixed arguments to pass to LOCAL_BOT_RUN_COMMAND.
export const LOCAL_BOT_RUN_ARGS = ['--silent', 'babel-watch', '--use-polling'];

// Binary file inside downloaded bot package to run.
export const NATIVE_BOT_MAIN_FILE = 'main.bin';

// Js file inside Node.js bot package.
export const NODE_BOT_MAIN_FILE = 'main.js';

/**
 * Bot Container; Used for running bot instanced inside specific compute service.
 */
export class NodeBotContainer extends EventEmitter implements BotContainer {
  private readonly _config: any;
  private readonly _sourceManager: SourceManager;

  private _controlTopic?: any;

  constructor (config: any) {
    super();

    this._config = config;
    this._sourceManager = new SourceManager(config);
  }

  async start (options: any) {
    const { controlTopic } = options;
    this._controlTopic = controlTopic;
  }

  async stop () {

  }

  async getBotAttributes (botName: string, botId: string, uniqId: string, ipfsCID: string, options: any): Promise<BotAttributes> {
    const installDirectory = await this._sourceManager.downloadAndInstallBot(uniqId, ipfsCID, options);
    assert(installDirectory, `Invalid install directory for bot: ${botName || ipfsCID}`);

    const childDir = path.join(installDirectory, SPAWNED_BOTS_DIR, botId);
    await fs.ensureDir(childDir);

    const { command, args } = this._getCommand(installDirectory);
    return { childDir, command, args };
  }

  /**
   * Get process command (to spawn).
   */
  private _getCommand (installDirectory: string) {
    return {
      command: 'node',
      args: [path.join(installDirectory, NODE_BOT_MAIN_FILE)]
    };
  }

  /**
   * Start bot instance.
   */
  async startBot (botId: string, botInfo: BotInfo | undefined, options: any = {}) {
    const { name, env, childDir, command, args } = botInfo || options;

    const wireEnv = {
      WIRE_BOT_CONTROL_TOPIC: keyToString(this._controlTopic),
      WIRE_BOT_UID: botId,
      WIRE_BOT_NAME: name,
      WIRE_BOT_CWD: childDir,
      WIRE_BOT_RESTARTED: (!!botInfo).toString()
    };

    const childOptions: SpawnOptions = {
      env: {
        ...process.env,
        NODE_OPTIONS: '',
        NODE_PATH: this._config.get('cli.nodePath'),
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
        watcher,
        stopped: false,
        ...timeState
      });
    } else {
      // New instance.
      botInfo = {
        botId,
        childDir,
        process: botProcess,
        id: options.botName,
        parties: [],
        command,
        args,
        watcher,
        stopped: false,
        name,
        env,
        ...timeState
      };
    }

    log(`Spawned bot: ${JSON.stringify({ pid: botProcess.pid, command, args, wireEnv, cwd: childDir })}`);

    botProcess.stdout!.on('data', (data) => {
      logBot[botProcess.pid](`${data}`);
    });

    botProcess.stderr!.on('data', (data) => {
      logBot[botProcess.pid](`${data}`);
    });

    botProcess.on('close', code => {
      this.emit('bot-close', botId, code);
      log(`Bot pid: ${botProcess.pid} exited with code ${code}.`);
    });

    botProcess.on('error', (err) => {
      logBot[botProcess.pid](`Error: ${err}`);
    });

    return botInfo;
  }

  async stopBot (botInfo: BotInfo) {
    const { process, watcher } = botInfo;

    if (process && process.pid) {
      kill(process.pid, 'SIGKILL');
    }
    if (watcher) {
      watcher.close();
    }
  }

  async killBot (botInfo: BotInfo) {
    await this.stopBot(botInfo);

    const { childDir } = botInfo;
    if (childDir) {
      await fs.remove(childDir);
    }
  }

  async removeSource () {
    await removeSourceFiles();
  }

  serializeBot ({ id, botId, type, childDir, parties, command, args, stopped, name, env }: BotInfo) {
    return {
      id,
      botId,
      type,
      name,
      childDir,
      parties,
      command,
      args,
      stopped,
      env
    };
  }
}
