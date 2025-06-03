export default {
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
      statements: 60,
      branches: 60,
      functions: 60,
      lines: 60
    }
  },
  moduleDirectories: ['node_modules', 'app'],
  moduleNameMapper: {
    '@components(.*)$': '<rootDir>/app/components$1',
    '@containers(.*)$': '<rootDir>/app/containers$1',
    '@utils(.*)$': '<rootDir>/app/utils$1',
    '@services(.*)$': '<rootDir>/app/services$1',
    '@themes(.*)$': '<rootDir>/app/themes$1',
    '@translations(.*)$': '<rootDir>/app/translations$1',
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/internals/mocks/cssModule.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/internals/mocks/image.js'
  },
  setupFilesAfterEnv: ['<rootDir>/internals/testing/test-bundler.js'],
  setupFiles: ['<rootDir>/node_modules/raf/polyfill'],
  testRegex: 'tests/.*\\.test\\.js$',
  snapshotSerializers: []
};
