//
// Copyright 2020 DXOS.org
//

import fs from 'fs-extra';
import path from 'path';

import { NODE_ENV } from '../env';
import { LOCAL_BOT_MAIN_FILE, SPAWNED_BOTS_DIR } from '../source-manager';
import { CommandInfo, ChildProcessContainer } from './child-process-container';
import { BotAttributes, LOCAL_BOT_RUN_COMMAND, LOCAL_BOT_RUN_ARGS } from './common';

/**
 * Local Bot Container; Used for running bots locally as a node process.
 */
export class LocalDevBotContainer extends ChildProcessContainer {
  async getBotAttributes (botId: string, installDirectory: string, options: any): Promise<BotAttributes> {
    const childDir = path.join(installDirectory, SPAWNED_BOTS_DIR, botId);
    await fs.ensureDir(childDir);

    const { command, args } = this._getCommand(options);
    return { childDir, command, args };
  }

  /**
   * Get process command (to spawn).
   */
  protected _getCommand (options: any): CommandInfo {
    const { botPath } = options;
    return {
      command: LOCAL_BOT_RUN_COMMAND,
      args: LOCAL_BOT_RUN_ARGS.concat([botPath || LOCAL_BOT_MAIN_FILE])
    };
  }

  async getAdditionalOpts (options: any): Promise<any> {
    const { env } = options;

    if (env === NODE_ENV) {
      return {
        NODE_PATH: this._config.get('cli.nodePath')
      };
    }
    return {};
  }
}
