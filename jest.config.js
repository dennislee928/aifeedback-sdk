module.exports = {
  // Use jsdom to simulate browser environment (change to 'node' for server-side only tests)
  testEnvironment: 'jsdom',

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // A list of paths to modules that Jest should use for coverage collection
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Transform files with babel-jest
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Setup files after environment
  setupFilesAfterEnv: [],

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Clear mocks between tests
  clearMocks: true,
};
