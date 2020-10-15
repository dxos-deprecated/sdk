module.exports = {
  rootDir: '../..',
  transform: {
    '^.+/src/.+(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+/dist/.+(js|jsx)$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@dxos)/)'
  ]
};
