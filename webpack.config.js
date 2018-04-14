const path = require('path')
const webpack = require('webpack')

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
            options: {presets: [['es2015', {modules: false}]]}
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  devtool: process.env.DEBUG ? 'inline-source-map' : false,
  externals: {
    'path-to-regexp': {
      commonjs: 'path-to-regexp',
      commonjs2: 'path-to-regexp',
      amd: 'path-to-regexp',
      root: 'pathToRegexp'
    }
  }
}
