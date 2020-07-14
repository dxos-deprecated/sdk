//
// Copyright 2020 DXOS.org
//

import { withMinimalContext } from "./with-minimal-context";

class TestAgent {
  constructor(ctx) {
    this._ctx = ctx;
  }

  tick () {
    this._ctx.models[0].createItem('example.com/Test', { foo: 1 });
  }
}


export default withMinimalContext(TestAgent);