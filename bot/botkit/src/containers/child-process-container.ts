//
// Copyright 2020 DXOS.org
//

import { spawn, SpawnOptions, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import moment from 'moment';
import watch from 'node-watch';
import path from 'path';
import kill from 'tree-kill';

import { keyToString } from '@dxos/crypto';
import { Spawn } from '@dxos/protocol-plugin-bot';

import { BotId, BotInfo } from '../bot-manager';
import { log, logBot } from '../log';
import { SPAWNED_BOTS_DIR } from '../source-manager';
import { BotContainer, ContainerStartOptions, NODE_BOT_MAIN_FILE } from './common';

export interface CommandInfo {
  command: string
  args: string[]
  env?: Record<string, string>
}

interface RunningBot {
  process: ChildProcess
  watcher: any;
}

/**
 * Bot Container; Used for running bot instanced inside specific compute service.
 */
export abstract class ChildProcessContainer extends EventEmitter implements BotContainer {
  protected readonly _config: any;

  private readonly _bots = new Map<BotId, RunningBot>() ;

  private _controlTopic?: any;

  constructor (config: any) {
    super();

    this._config = config;
  }

  /**
   * Get process command (to spawn).
   */
  protected abstract _getCommand (installDirectory: string, spawnOptions: Spawn.SpawnOptions): CommandInfo;

  async start ({ controlTopic }: ContainerStartOptions) {
    this._controlTopic = controlTopic;
  }

  async stop () {

  }

  /**
   * Start bot instance.
   */
  async startBot (botInfo: BotInfo) {
    const { botId, name, installDirectory, spawnOptions } = botInfo;
    const childDir = path.join(installDirectory, SPAWNED_BOTS_DIR, botId);
    await fs.ensureDir(childDir);

    const { command, args, env: childEnv } = this._getCommand(installDirectory, spawnOptions);

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
        ...childEnv,
        ...wireEnv
      },

      cwd: childDir,

      // https://nodejs.org/api/child_process.html#child_process_options_detached
      detached: false
    };

    const botProcess = spawn(command, args, childOptions);

    // TODO(marik-d): Fix this.
    const timeState = {
      started: moment.utc(),
      lastActive: moment.utc()
    };
    const watcher = watch(childDir, { recursive: true }, () => {
      timeState.lastActive = moment.utc();
    });

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

    this._bots.set(botId, {
      process: botProcess,
      watcher
    })
  }

  async stopBot (botInfo: BotInfo): Promise<void> {
    const { process, watcher } = this._bots.get(botInfo.botId)!;

    return new Promise(resolve => {
      if (watcher) {
        watcher.close();
      }
      if (process && process.pid) {
        kill(process.pid, 'SIGKILL', () => {
          resolve();
        });
      }
    });
  }

  // TODO(marik-d): Remove: BotManager should handle bot directories.
  async killBot (botInfo: BotInfo) {
    // await this.stopBot(botInfo);

    // const { childDir } = botInfo;
    // if (childDir) {
    //   await fs.remove(childDir);
    // }
  }
}
