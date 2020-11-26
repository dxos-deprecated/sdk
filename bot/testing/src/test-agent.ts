//
// Copyright 2020 DXOS.org
//

import { waitForCondition } from '@dxos/async';
import { Bot, getConfig } from '@dxos/bot';
import { createId } from '@dxos/crypto';
import { MessengerModel } from '@dxos/messenger-model';
import { Item } from '@dxos/echo-db';

export const ITEM_TYPE = 'dxos.org/type/testing/object';

class TestAgent extends Bot {
  /** @type {Item<MessengerModel>} */
  _item: Item<MessengerModel>;

  constructor (config: any, options?: any) {
    super(config, options);

    this.on('party', partyKey => {
      this._item = this._client?.echo.getParty(partyKey).database.queryItems({ type: ITEM_TYPE }).value[0];
      this._client?.echo.getParty(partyKey).database.queryItems({ type: ITEM_TYPE }).subscribe(items => {
        this._item = items[0];
      });
    });
  }

  async _preInit () {
    this._client?.registerModel(MessengerModel);
  }

  async botCommandHandler (command: any) {
    await waitForCondition(() => !!this._item);
    switch (command.type) {
      case 'append': {
        await this._item.model.sendMessage({ id: createId(), text: 'Hello world!', sender: 'Sender', timestamp: new Date().toString() });
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
