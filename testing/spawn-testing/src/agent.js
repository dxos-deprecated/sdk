//
// Copyright 2020 DXOS.org
//

import { withClientContext } from './context';
import { ObjectModel } from '@dxos/echo-db';

class Agent {
  constructor (ctx) {
    this._ctx = ctx;
  }

  async init () {
    this._model = await this._ctx.createModel(ObjectModel, { type: 'example.com/Test' });
  }

  tick () {
    for(let i = 0; i < 100; i++) {
      this._model.createItem('example.com/Test', { foo: 1 });
    }
  }
}

export default withClientContext(Agent);
