//
// Copyright 2020 DXOS.org
//

import React from 'react';
import ReactDOM from 'react-dom';

import { Config } from '@dxos/config';

import Root from './containers/Root';

(async () => {
  
  // TODO(burdon): Construct minimal config.
  const config = new Config({
    app: {
      publicUrl: '/'
    },
    debug: {
      mode: 'development'
    }
  });

  ReactDOM.render(<Root config={config.values} />, document.getElementById('root'));
})();
