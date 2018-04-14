const fs = require('fs')
const del = require('del')
const webpack = require('webpack')
const config = require('../webpack.config')
const pkg = require('../package.json')

const BUILD_DIR = 'build'

// Clean up the output directory
del([`${BUILD_DIR}/*`])

webpack(config, (err, stats) => {
  if (err) {
    console.error(err.stack || err)
    if (err.details) {
      console.error(err.details)
    }
    return
  }

  const info = stats.toJson()

  if (stats.hasErrors()) {
    console.error(info.errors)
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings)
  }

  delete pkg.private
  delete pkg.devDependencies
  delete pkg.scripts
  delete pkg.standard
  delete pkg.babel
  fs.writeFileSync(`${BUILD_DIR}/package.json`, JSON.stringify(pkg, null, '  '), 'utf-8')
  fs.writeFileSync(`${BUILD_DIR}/LICENSE`, fs.readFileSync('LICENSE', 'utf-8'), 'utf-8')
  fs.writeFileSync(`${BUILD_DIR}/README.md`, fs.readFileSync('README.md', 'utf-8'), 'utf-8')
})
