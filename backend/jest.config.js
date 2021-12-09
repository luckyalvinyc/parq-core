export default {
  verbose: true,
  resetMocks: true,
  resetModules: true,
  moduleNameMapper: {
    '^#tests/(.*\\.js)': '<rootDir>/tests/$1',
  },
  testEnvironment: '<rootDir>/tests/custom-environment.js',
  globalSetup: '<rootDir>/tests/setup.js'
}
