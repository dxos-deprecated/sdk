module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  coverageDirectory: 'packages/react-appkit/coverage',
  transformIgnorePatterns: [
    'node_modules/(?!(@dxos)/)'
  ]
};
