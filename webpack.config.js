const path = require('path')

console.log(__dirname)

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './lib/router.js',
  output: {
    library: {
      root: 'Cherrytree',
      amd: 'cherrytreex',
      commonjs: 'cherrytreex'
    },
    libraryTarget: 'umd',
    path: path.join(__dirname, 'build'),
    filename: 'cherrytree.js'
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
            options: { presets: [['es2015', { modules: false }]] }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: false
  },
  devtool: 'source-map',
  externals: {
    'path-to-regexp': {
      commonjs: 'path-to-regexp',
      commonjs2: 'path-to-regexp',
      amd: 'path-to-regexp',
      root: 'pathToRegexp'
    }
  }
}
