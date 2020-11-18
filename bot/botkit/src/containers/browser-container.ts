//
// Copyright 2020 DXOS.org
//

import { Spawn } from '@dxos/protocol-plugin-bot';
import { EventEmitter } from 'events';
import moment from 'moment';
import path from 'path';
import playwright from 'playwright';
import { sync as findPkgJson } from 'pkg-up'
import debug from 'debug'

const log = debug('dxos:botkit:container:browser')

import { BotInfo } from '../bot-manager';
import { BotContainer } from './common';

// TODO(egorgripasov): Allow consumer to select.
const BROWSER_TYPE = 'chromium';

export class BrowserContainer extends EventEmitter implements BotContainer {
  private readonly _config: any;

  private _controlTopic?: any;
  private _browser!: playwright.ChromiumBrowser;

  constructor (config: any) {
    super();

    this._config = config;
  }

  async start (options: any) {
    const { controlTopic } = options;
    this._controlTopic = controlTopic;

    this._browser = await playwright[BROWSER_TYPE].launch();
  }

  async stop () {
    await this._browser.close();  
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getBotAttributes (botId: string, installDirectory: string, options: Spawn.SpawnOptions): Promise<any> {
    const botFilePath = path.join(installDirectory, 'main.js');
    return { botFilePath };
  }

  async startBot (botId: string, botInfo: BotInfo | undefined, options: any = {}): Promise<any> {
    const { botFilePath, env, name } = botInfo || options;

    const context = await this._browser.newContext();
    const page = await context.newPage();
    
    await page.goto(`file:${path.join(path.dirname(findPkgJson({ cwd: __dirname })!), 'res/browser-test.html')}`);
    log(`Injecting script ${botFilePath}`)
    await page.addScriptTag({ path: botFilePath });

    const timeState = {
      started: moment.utc(),
      lastActive: moment.utc()
    };

    if (botInfo) {
      // Restart.
      Object.assign(botInfo, {
        context,
        page,
        stopped: false,
        ...timeState
      });
    } else {
      // New instance.
      botInfo = {
        botId,
        context,
        page,
        id: options.botName,
        parties: [],
        stopped: false,
        name,
        env,
        ...timeState
      };
    }

    return botInfo;
  }

  async stopBot (botInfo: BotInfo) {
    const { context } = botInfo;

    if (context) {
      await context.close();
    }
  }

  async killBot (botInfo: BotInfo) {
    await this.stopBot(botInfo);
  }

  serializeBot ({ id, botId, type, parties, stopped, name, env }: BotInfo) {
    return {
      id,
      botId,
      type,
      name,
      parties,
      stopped,
      env
    };
  }
}
