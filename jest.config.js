module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    '!services/**/__tests__/**'
  ],
  verbose: true,
  // Suppress console outputs during tests for cleaner output
  silent: false, // Set to true to suppress all console outputs
  // Or selectively suppress specific console methods:
  // setupFilesAfterEnv will handle console mocking
};
