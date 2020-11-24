//
// Copyright 2020 DXOS.org
//

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
}
