module.exports = {
  rootDir: '../..',
  transform: {
    '^.+/(src|dist|tests)/.+(js|jsx)$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@dxos)/)'
  ],
  coverageDirectory: 'packages/react-appkit/coverage'
};
