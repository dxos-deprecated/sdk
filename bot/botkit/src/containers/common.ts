//
// Copyright 2020 DXOS.org
//

import { BotInfo } from '../bot-manager';

/**
 * Container specific attributes for bot startup.
 */
export interface BotAttributes {
  childDir: string,
  command: string,
  args: string[]
}

export interface BotContainer {

  start(options: any): Promise<void>

  on(event: 'bot-close', cb: (botId: string, code: number) => void): void;

  getBotAttributes (botId: string, installDirectory: string, options: any): Promise<BotAttributes>;

  /**
   * Start bot instance.
   */
  startBot (botId: string, botInfo: BotInfo | undefined, options: any): Promise<BotInfo>;

  stopBot (botInfo: BotInfo): Promise<void>

  killBot (botInfo: BotInfo): Promise<void>;

  /**
   * Removes all source files downloaded.
   */
  removeSource (): Promise<void>

  /**
   * Serializes BotInfo into JSON state that's gonna be persisted across restarts.
   */
  serializeBot (botInfo: BotInfo): any;

  stop(): Promise<void>;
}

export interface SpawnContainer extends BotContainer {
  /**
   * Additional options for spawn bot process env.
   */
  getAdditionalOpts (options: any): Promise<any>
}

// Command to spawn to run a bot in local development mode.
export const LOCAL_BOT_RUN_COMMAND = 'yarn';

// Fixed arguments to pass to LOCAL_BOT_RUN_COMMAND.
export const LOCAL_BOT_RUN_ARGS = ['--silent', 'babel-watch', '--use-polling'];

// Binary file inside downloaded bot package to run.
export const NATIVE_BOT_MAIN_FILE = 'main.bin';

// Js file inside Node.js bot package.
export const NODE_BOT_MAIN_FILE = 'main.js';
