//
// Copyright 2020 DXOS.org
//

import path from 'path';

import { NODE_BOT_MAIN_FILE } from './common';
import { SpawnBotContainer } from './spawn-container';

/**
 * Node Bot Container; Used for spawning bots as node processes.
 */
export class NodeBotContainer extends SpawnBotContainer {
  /**
   * Get process command (to spawn).
   */
  protected _getCommand (installDirectory: string) {
    return {
      command: 'node',
      args: [path.join(installDirectory, NODE_BOT_MAIN_FILE)]
    };
  }

  protected async _getAdditionalOpts (options: any): Promise<any> {
    return {
      NODE_PATH: this._config.get('cli.nodePath'),
    };
  }
}
