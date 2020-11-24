//
// Copyright 2020 DXOS.org
//

import { Spawn } from '@dxos/protocol-plugin-bot';

import { LOCAL_BOT_MAIN_FILE } from '../source-manager';
import { CommandInfo, ChildProcessContainer } from './child-process-container';
import { LOCAL_BOT_RUN_COMMAND, LOCAL_BOT_RUN_ARGS } from './common';

/**
 * Local Bot Container; Used for running bots locally as a node process.
 */
export class LocalDevBotContainer extends ChildProcessContainer {
  /**
   * Get process command (to spawn).
   */
  protected _getCommand (installDirectory: string, spawnOptions: Spawn.SpawnOptions): CommandInfo {
    const { botPath } = spawnOptions;
    return {
      command: LOCAL_BOT_RUN_COMMAND,
      args: LOCAL_BOT_RUN_ARGS.concat([botPath || LOCAL_BOT_MAIN_FILE]),
      env: {
        NODE_PATH: this._config.get('cli.nodePath')
      }
    };
  }
}
