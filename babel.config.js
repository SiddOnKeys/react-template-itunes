module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        shippedProposals: true,
        targets: {
          esmodules: true
        }
      }
    ],
    '@babel/preset-react'
  ],
  plugins: [
    [
      'transform-imports',
      {
        lodash: {
          transform: 'lodash/${member}',
          preventFullImport: true
        }
      }
    ],
    'macros',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-optional-chaining',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    [
      'module-resolver',
      {
        root: ['./app'],
        alias: {
          '@components': './app/components',
          '@containers': './app/containers',
          '@utils': './app/utils',
          '@services': './app/services',
          '@themes': './app/themes',
          '@translations': './app/translations'
        }
      }
    ],
    [
      '@emotion',
      {
        importMap: {
          '@mui/system': {
            styled: {
              canonicalImport: ['@emotion/styled', 'default'],
              styledBaseImport: ['@mui/system', 'styled']
            }
          },
          '@mui/material/styles': {
            styled: {
              canonicalImport: ['@emotion/styled', 'default'],
              styledBaseImport: ['@mui/material/styles', 'styled']
            }
          }
        }
      }
    ]
  ],
  env: {
    production: {
      only: ['app'],
      plugins: [
        [
          'transform-react-remove-prop-types',
          {
            removeImport: true
          }
        ],
        [
          'babel-plugin-import',
          {
            libraryName: '@mui/material',
            libraryDirectory: '',
            camel2DashComponentName: false
          },
          'core'
        ],
        [
          'babel-plugin-import',
          {
            libraryName: '@mui/icons-material',
            libraryDirectory: '',
            camel2DashComponentName: false
          },
          'icons'
        ]
      ]
    },
    development: {
      plugins: [
        [
          'babel-plugin-import',
          {
            libraryName: '@mui/material',
            libraryDirectory: '',
            camel2DashComponentName: false
          },
          'core'
        ],
        [
          'babel-plugin-import',
          {
            libraryName: '@mui/icons-material',
            libraryDirectory: '',
            camel2DashComponentName: false
          },
          'icons'
        ]
      ]
    },
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        'dynamic-import-node',
        [
          'babel-plugin-import',
          {
            libraryName: '@mui/material',
            libraryDirectory: '',
            camel2DashComponentName: false
          },
          'core'
        ],
        [
          'babel-plugin-import',
          {
            libraryName: '@mui/icons-material',
            libraryDirectory: '',
            camel2DashComponentName: false
          },
          'icons'
        ],
        [
          '@emotion',
          {
            autoLabel: 'never'
          }
        ]
      ]
    }
  }
};
