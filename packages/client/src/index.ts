//
// Copyright 2020 DXOS.org
//

import queueMicrotask from 'queue-microtask';

// The webpack shim process.nextTick is based on setTimeout(fn, 0). The worst thing to do.
// This hack fix that problem for now until we find a better solution and improve the latency.
if (typeof window !== 'undefined') {
  process.nextTick = (...args: any[]) => {
    const cb = args.length === 1
      ? args[0]
      : () => args[0](...args.slice(1));
      
    if (args.length === 1) {
      if(!!window.queueMicrotask) {
        window.queueMicrotask(cb);
      } else {
        queueMicrotask(cb);
      }
    }
  };
}

export * from './client';
