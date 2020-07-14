//
// Copyright 2020 DXOS.org
//

import { MinimalAgent as Agent } from './';

export default class TestAgent extends Agent {
  tick () {
    this.models[0].createItem('example.com/Test', { foo: 1 });
  }
}
