const path = require('path')

module.exports = {
  context: __dirname,
  entry: './lib/router.js',
  output: {
    library: 'cherrytree',
    libraryTarget: 'umd',
    filename: path.join('build', 'cherrytree.js')
  },
  resolve: {
    alias: {
      'cherrytree': __dirname,
      'expect': 'referee/lib/expect'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {presets: ['es2015']}
          }
        ]
      }
    ]
  },
  devtool: process.env.DEBUG ? 'inline-source-map' : false
}
