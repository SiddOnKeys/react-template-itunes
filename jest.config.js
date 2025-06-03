module.exports = {
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    '!app/**/*.test.{js,jsx}',
    '!app/*/RbGenerated*/*.{js,jsx}',
    '!app/app.js',
    '!app/global-styles.js',
    '!app/*/*/Loadable.{js,jsx}'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  moduleDirectories: ['node_modules', 'app'],
  moduleNameMapper: {
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/internals/mocks/cssModule.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/internals/mocks/image.js',
    '^@app(.*)$': '<rootDir>/app$1',
    '^@containers(.*)$': '<rootDir>/app/containers$1',
    '^@components(.*)$': '<rootDir>/app/components$1',
    '^@utils(.*)$': '<rootDir>/app/utils$1',
    '^@themes(.*)$': '<rootDir>/app/themes$1',
    '^@services(.*)$': '<rootDir>/app/services$1'
  },
  setupFilesAfterEnv: ['<rootDir>/internals/testing/test-setup.js'],
  testEnvironment: 'jsdom',
  testRegex: 'tests/.*\\.test\\.js$',
  snapshotSerializers: []
};
