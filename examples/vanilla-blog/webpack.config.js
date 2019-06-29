const path = require('path')

module.exports = {
  context: __dirname,
  entry: './index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  resolve: {
    modules: [path.resolve(__dirname, './client/shared'), 'node_modules'],
  },
  module: {
    rules: [
      { test: /\.html$/, loader: 'underscore-template-loader' }
    ]
  }
}
