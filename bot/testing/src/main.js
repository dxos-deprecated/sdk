//
// Copyright 2020 DXOS.org
//

import { waitForCondition } from '@dxos/async';
import { Bot, getConfig } from '@dxos/botkit';
import { keyToString } from '@dxos/crypto';

export const ITEM_TYPE = 'dxos.org/type/testing/object'

class TestAgent extends Bot {
  constructor(config, options) {
    super(config, options);

    this.on('party', partyKey => {
      console.log('new party', keyToString(partyKey))
      this._client.echo.getParty(partyKey).database.queryItems({ type: ITEM_TYPE }).subscribe(items => {
        console.log('got item')  
        this._item = items[0];
      })
    })
  }

  async botCommandHandler (command) {
    switch (command.type) {
      case 'append': {
        await waitForCondition(() => !!this._item)
        const count = this._item.model.getProperty('count');
        await this._item.model.setProperty('count', count + 1)
        break;
      }
      case 'get-all': {
        await waitForCondition(() => !!this._item)
        return { count: this._item.model.getProperty('count') };
      }
      default:
        break;
    }
  }
}

new TestAgent(getConfig()).start();
