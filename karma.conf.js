/* eslint-disable import/no-extraneous-dependencies */
const { createDefaultConfig } = require('@open-wc/testing-karma')
const merge = require('deepmerge')

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        // runs all files ending with .test in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm run test -- --grep test/foo/bar.test.js
        // npm run test -- --grep test/bar/*
        { pattern: config.grep ? config.grep : 'tests/**/*Test.js', type: 'module' }
      ],

      esm: {
        nodeResolve: true
      },

      customLaunchers: {
        ChromeDebugging: {
          base: 'Chrome',
          flags: ['--remote-debugging-port=9333']
        }
      }
    })
  )
  // remove snapshot support
  delete config.preprocessors
  config.frameworks = config.frameworks.filter(framework => !framework.includes('snapshot'))
  config.files = config.files.filter(file => typeof file !== 'string' || !file.includes('__snapshots__'))
  config.plugins = config.plugins.filter(path => !path.includes('snapshot'))
  return config
}
