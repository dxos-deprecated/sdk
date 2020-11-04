//
// Copyright 2020 DXOS.org
//

import { Bot, getConfig } from '@dxos/botkit';

class TestAgent extends Bot {
  _count = 0;

  async botCommandHandler (message) {
    const command = JSON.parse(message.toString()) || {};
    let result = {};
    switch (command.type) {
      case 'append': {
        this._count++;
        break;
      }
      case 'get-all': {
        result = { count: this._count };
        break;
      }
      default:
        break;
    }

    return Buffer.from(JSON.stringify(result));
  }
}

new TestAgent(getConfig()).start();
