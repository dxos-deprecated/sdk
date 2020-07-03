//
// Copyright 2020 DXOS.
//

import { Duplex } from 'streamx';
import nanomessagerpc from 'nanomessage-rpc';

export function createRPC (ipc) {
  const stream = new Duplex({
    write (data, cb) {
      ipc.send(data);
      cb(null);
    },
    destroy (cb) {
      if (ipc.killed || !ipc.finally) {
        return cb();
      }

      ipc.catch((err) => {
        if (!err.isCanceled) {
          throw err;
        }
      }).finally(cb);
      ipc.cancel();
    }
  });

  ipc.on('message', data => {
    stream.push(data);
  });

  return nanomessagerpc(stream, {
    // timeout: Infinity
  });
}
