//
// Copyright 2020 DXOS.org
//

import assert from 'assert';
import fs from 'fs-extra';
import path from 'path';

import { NODE_ENV } from '../env';
import { LOCAL_BOT_MAIN_FILE } from '../source-manager';
import { BotAttributes, SPAWNED_BOTS_DIR, LOCAL_BOT_RUN_COMMAND, LOCAL_BOT_RUN_ARGS } from './common';
import { CommandInfo, SpawnBotContainer } from './spawn-container';

/**
 * Local Bot Container; Used for running bots locally as a node process.
 */
export class LocalDevBotContainer extends SpawnBotContainer {

  async getBotAttributes (botName: string, botId: string, uniqId: string, ipfsCID: string, options: any): Promise<BotAttributes> {
    const installDirectory = await this._sourceManager.downloadAndInstallBot(uniqId, ipfsCID, options);
    assert(installDirectory, `Invalid install directory for bot: ${botName || ipfsCID}`);

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

  protected async _getAdditionalOpts (options: any): Promise<any> {
    const { env } = options;

    if (env === NODE_ENV) {
      return {
        NODE_PATH: this._config.get('cli.nodePath')
      }
    }
    return {};
  }
}
