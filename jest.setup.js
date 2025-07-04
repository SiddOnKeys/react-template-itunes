// jest.config.js
export default {
  collectCoverageFrom: [
    'app/**/*.{js,jsx}',
    'uat/**/*.js',
    '!app/**/*.test.{js,jsx}',
    '!app/*/RbGenerated*/*.{js,jsx}',
    '!app/app.js',
    '!app/components/ScrollToTop/*.js',
    '!app/components/ErrorBoundary/*.js',
    '!app/global-styles.js',
    '!app/*/*/loadable.{js,jsx}',
    '!**/loadable.js',
    '!**/apiUtils.js',
    '!**/testUtils.js',
    '!**/stories/**',
    '!**/themes/index.js'
  ],
  testEnvironment: 'jsdom',
  reporters: [
    'default',
    [
      'jest-sonar',
      {
        outputDirectory: 'reports',
        outputName: 'test-report.xml',
        relativeRootDir: './',
        reportedFilePath: 'relative'
      }
    ]
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  },
  coverageReporters: ['json-summary', 'text', 'lcov'],
  moduleDirectories: ['node_modules', 'app'],
  moduleNameMapper: {
    '@app(.*)$': '<rootDir>/app/$1',
    '@(containers|components|services|utils|themes)(.*)$': '<rootDir>/app/$1/$2',
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/internals/mocks/cssModule.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/internals/mocks/image.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/internals/testing/test-bundler.js'],
  setupFiles: ['<rootDir>/node_modules/raf/polyfill'],
  testRegex: 'tests/.*\\.test\\.js$',
  snapshotSerializers: []
};
