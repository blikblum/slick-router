const path = require('path')

module.exports = {
  context: __dirname,
  entry: './index',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devtool: 'source-map',  
  module: {
    rules: [
      { test: /.*\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
}
