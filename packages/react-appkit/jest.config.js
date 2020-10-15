module.exports = {
  rootDir: '../..',
  transform: {
    '^apps/teamwork-app/src/tests/.+(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    '^node_modules/@dxos/.+(js|jsx)$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@dxos)/)'
  ]
};
