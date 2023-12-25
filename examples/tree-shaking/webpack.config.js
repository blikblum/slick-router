const path = require('path')

const DIST_DIR = 'dist'

const baseConfig = {
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, DIST_DIR)
  },
  devtool: false,
  optimization: {
    concatenateModules: true,
    minimize: true
  }
}

const entries = [
  'animated-outlet',
  'router',
  'router-intercept',
  'router-wc',
  'router-routerlinks',
  'router-wc-routerlinks'
]

const configs = entries.map(entry => {
  return Object.assign({ entry: { [entry]: `./${entry}.js` } }, baseConfig)
})

module.exports = configs
