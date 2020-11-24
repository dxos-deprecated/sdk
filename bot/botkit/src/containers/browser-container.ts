//
// Copyright 2020 DXOS.org
//

import debug from 'debug';
import { EventEmitter } from 'events';
import moment from 'moment';
import path from 'path';
import { sync as findPkgJson } from 'pkg-up';
import playwright from 'playwright';

import { keyToString } from '@dxos/crypto';
import { Spawn } from '@dxos/protocol-plugin-bot';

import { BotInfo } from '../bot-manager';
import { logBot } from '../log';
import { BotContainer } from './common';

const log = debug('dxos:botkit:container:browser');

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

  async startBot (botId: string, botInfo: BotInfo | undefined, options: any = {}): Promise<any> {
    const { env, name } = botInfo || options;
    const { installDirectory } = options;
    const botFilePath = path.join(installDirectory, 'main.js');

    const wireEnv = {
      ...process.env,
      NODE_OPTIONS: '',
      WIRE_BOT_CONTROL_TOPIC: keyToString(this._controlTopic),
      WIRE_BOT_UID: botId,
      WIRE_BOT_NAME: name,
      WIRE_BOT_CWD: '/dxos/bot',
      WIRE_BOT_RESTARTED: (!!botInfo).toString(),
      WIRE_BOT_PERSISTENT: 'false' // Storage is currently broken
    };

    log('Creating context');
    const context = await this._browser.newContext();
    log('Creating page');
    const page = await context.newPage();

    page.on('pageerror', error => {
      logBot[botId](error.stack);
    });
    page.on('console', msg => {
      log('Console', msg.type(), msg.text());
      logBot[botId](msg.text());
    });

    log('Navigating to index.html');
    await page.goto(`file:${path.join(path.dirname(findPkgJson({ cwd: __dirname })!), 'res/browser-test.html')}`);
    log('Injecting env', wireEnv);
    await page.evaluate((wireEnv) => {
      ((window.process as any) ||= {}).env = wireEnv;
    }, wireEnv);
    log(`Injecting script ${botFilePath}`);
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
