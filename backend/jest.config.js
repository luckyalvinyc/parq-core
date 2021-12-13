export default {
  verbose: true,
  resetModules: true,
  restoreMocks: true,
  moduleNameMapper: {
    '^#config$': '<rootDir>/config.js',
    '^#server': '<rootDir>/src/server.js',
    '^#stores$': '<rootDir>/src/stores/index.js',
    '^#tests/(.*\\.js)$': '<rootDir>/tests/$1'
  },
  testEnvironment: '<rootDir>/tests/custom-environment.js',
  globalSetup: '<rootDir>/tests/setup.js'
}
