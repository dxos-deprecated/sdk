//
// Copyright 2020 DXOS.org
//

export const config = {
  client: {
    keyStorage: {
      type: 'ram'
    },

    feedStorage: {
      root: './echo/feeds',
      type: 'ram'
    }
  },
  debug: {
    mode: 'development'
  },
  services: {
    registry: {
      server: 'http://example.com',
      chainId: 'example'
    }
  }
};
