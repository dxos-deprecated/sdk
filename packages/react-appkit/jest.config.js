//
// Copyright 2020 DXOS.org
//

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  coverageDirectory: 'coverage',
  transformIgnorePatterns: [
    'node_modules/(?!(@dxos)/)'
  ],
  testTimeout: 20000
};
