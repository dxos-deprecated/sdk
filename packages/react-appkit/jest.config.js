module.exports = {
  rootDir: '../..',
  transform: {
    // "^((packages/react-appkit)|(node_modules/@dxos))/.+\\.(js|jsx)$": "<rootDir>/node_modules/babel-jest",
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@dxos)/)'
  ]
};
