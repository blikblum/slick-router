/**
 * Run karma start --no-coverage to get non instrumented code to show up in the dev tools
 */

const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')

function config (c) {
  return {

    frameworks: ['mocha'],

    plugins: ['karma-mocha', 'karma-rollup-preprocessor', 'karma-chrome-launcher'],

    preprocessors: {
      'tests/index.js': ['rollup']
    },

    files: [
      'tests/index.js'
    ],

    reporters: c.coverage ? ['progress', 'coverage'] : ['progress'],

    // this watcher watches when bundled files are updated
    autoWatch: true,

    rollupPreprocessor: {
      /**
       * This is just a normal Rollup config object,
       * except that `input` is handled for you.
       */
      plugins: [
        babel({
          babelrc: false,
          exclude: ['node_modules/**'],
          'presets': [
            [
              '@babel/preset-env',
              {
                'targets': {
                  'browsers': [
                    'chrome 60'
                  ]
                }
              }
            ]
          ]
        }),
        nodeResolve(),
        commonjs({
          namedExports: {
            '@sinonjs/referee': ['assert', 'refute'],
            '@sinonjs/referee-sinon': ['assert', 'sinon']
          }
        })
      ],

      output: {
        format: 'iife', // Helps prevent naming collisions.
        name: 'cherrytreeTests', // Required for 'iife' format.
        sourcemap: 'inline' // Sensible for testing.
      }
    },

    client: {
      useIframe: true,
      captureConsole: true,
      mocha: {
        ui: 'qunit'
      }
    },

    browsers: ['Chrome'],
    browserNoActivityTimeout: 30000,

    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9333']
      }
    },

    coverageReporter: c.coverage ? {
      reporters: [
        { type: 'html', dir: 'coverage/' },
        { type: 'text-summary' }
      ]
    } : {}
  }
}

module.exports = function (c) {
  c.coverage = c.coverage !== false
  c.set(config(c))
}

module.exports.config = config
