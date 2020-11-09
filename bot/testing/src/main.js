//
// Copyright 2020 DXOS.org
//

import { waitForCondition } from '@dxos/async';
import { Bot, getConfig } from '@dxos/botkit';
import { createId, keyToString } from '@dxos/crypto';
import { Item } from '@dxos/echo-db';
import { MessengerModel } from '@dxos/messenger-model';

export const ITEM_TYPE = 'dxos.org/type/testing/object';

class TestAgent extends Bot {


  /** @type {Item<MessengerModel>} */
  _item;

  constructor (config, options) {
    super(config, options);

    this.on('party', partyKey => {
      console.log('new party', keyToString(partyKey));
      this._client.echo.getParty(partyKey).database.queryItems({ type: ITEM_TYPE }).subscribe(items => {
        console.log('got item');
        this._item = items[0];
      });
    });
  }

  async botCommandHandler (command) {
    await waitForCondition(() => !!this._item);
    switch (command.type) {
      case 'append': {
        this._item.model.sendMessage({ id: createId(), text: 'Hello world!', sender: 'Sender', timestamp: Date.now() });
        break;
      }
      case 'get-all': {
        return this._item.model.messages;
      }
      default:
        break;
    }
  }
}

new TestAgent(getConfig()).start();
