export default {
  verbose: true,
  resetMocks: true,
  resetModules: true,
  moduleNameMapper: {
    '^#config$': '<rootDir>/config.js',
    '^#stores$': '<rootDir>/src/stores/index.js',
    '^#tests/(.*\\.js)$': '<rootDir>/tests/$1'
  },
  testEnvironment: '<rootDir>/tests/custom-environment.js',
  globalSetup: '<rootDir>/tests/setup.js'
}
