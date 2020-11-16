//
// Copyright 2020 DXOS.org
//

import path from 'path';

import { ChildProcessContainer } from './child-process-container';
import { NODE_BOT_MAIN_FILE } from './common';

/**
 * Node Bot Container; Used for spawning bots as node processes.
 */
export class NodeBotContainer extends ChildProcessContainer {
  /**
   * Get process command (to spawn).
   */
  protected _getCommand (installDirectory: string) {
    return {
      command: 'node',
      args: [path.join(installDirectory, NODE_BOT_MAIN_FILE)]
    };
  }

  async getAdditionalOpts (): Promise<any> {
    return {
      NODE_PATH: this._config.get('cli.nodePath')
    };
  }
}
