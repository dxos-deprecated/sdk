//
// Copyright 2020 DXOS.org
//

import path from 'path';

import { NATIVE_BOT_MAIN_FILE } from './common';
import { CommandInfo, SpawnBotContainer } from './spawn-container';

/**
 * Native Bot Container; Used for spawning bots as native binaries.
 */
export class NativeBotContainer extends SpawnBotContainer {
  /**
   * Get process command (to spawn).
   */
  protected _getCommand (installDirectory: string): CommandInfo {
    return {
      command: path.join(installDirectory, NATIVE_BOT_MAIN_FILE),
      args: []
    };
  }
}
