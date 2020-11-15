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

  getBotAttributes (botName: string, botId: string, uniqId: string, ipfsCID: string, options: any): Promise<BotAttributes>;

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
