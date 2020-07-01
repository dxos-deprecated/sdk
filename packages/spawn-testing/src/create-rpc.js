//
// Copyright 2020 DXOS.
//

const { Duplex } = require('streamx');
const nanomessagerpc = require('nanomessage-rpc');

module.exports = function createRPC (ipc) {
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

  return nanomessagerpc(stream);
};
