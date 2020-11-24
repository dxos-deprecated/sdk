//
// Copyright 2020 DXOS.org
//

import { Spawn } from '@dxos/protocol-plugin-bot';

import { BotInfo } from '../bot-manager';

export interface ContainerStartOptions {
  controlTopic: Buffer
}

export interface BotContainer {
  /**
   * Start container.
   */
  start(options: ContainerStartOptions): Promise<void>

  /**
   * Stop container.
   */
  stop(): Promise<void>;

  on(event: 'bot-close', cb: (botId: string, code: number) => void): void;

  /**
   * Start bot instance.
   */
  startBot (botInfo: BotInfo): Promise<void>;

  /**
   * Stop bot instance.
   */
  stopBot (botInfo: BotInfo): Promise<void>

  /**
   * Stop bot instance and remove it's data.
   */
  // TODO(marik-d): Remove this: bot manager should handle bot data files.
  killBot (botInfo: BotInfo): Promise<void>;
}

// Command to spawn to run a bot in local development mode.
export const LOCAL_BOT_RUN_COMMAND = 'yarn';

// Fixed arguments to pass to LOCAL_BOT_RUN_COMMAND.
export const LOCAL_BOT_RUN_ARGS = ['--silent', 'babel-watch', '--use-polling'];

// Binary file inside downloaded bot package to run.
export const NATIVE_BOT_MAIN_FILE = 'main.bin';

// Js file inside Node.js bot package.
export const NODE_BOT_MAIN_FILE = 'main.js';
