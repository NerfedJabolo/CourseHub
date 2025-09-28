// jest.config.mjs
export default {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  transform: { '^.+\\.js$': 'babel-jest' },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js']
};
