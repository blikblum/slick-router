/* eslint-disable import/no-extraneous-dependencies */
const { createDefaultConfig } = require('@open-wc/testing-karma')
const merge = require('webpack-merge')
const path = require('path')

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        'node_modules/@sinonjs/referee/dist/referee.js',
        // runs all files ending with .test in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm run test -- --grep test/foo/bar.test.js
        // npm run test -- --grep test/bar/*
        { pattern: config.grep ? config.grep : 'tests/**/*Test.js', type: 'module' }
      ],

      customLaunchers: {
        ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags: [
            '--no-sandbox', // default karma-esm configuration
            '--disable-setuid-sandbox', // default karma-esm configuration
            '--enable-experimental-web-platform-features' // necessary when using importMap option
          ]
        },
        ChromeExt: {
          base: 'Chrome',
          flags: [
            '--enable-experimental-web-platform-features' // necessary when using importMap option
          ]
        }
      },

      esm: {
        nodeResolve: true,
        importMap: path.resolve(__dirname, 'tests/importmap.json')
      }
      // you can overwrite/extend the config further
    })
  )
  return config
}
