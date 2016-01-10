var path = require('path')
var webpack = require('webpack')

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: [
    './src/index.jsx',
  ],
  output: {
    publicPath: '/',
    path: path.join( __dirname, '/dist'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'animachine': path.join(__dirname, '../src/index.js'),
      'animachine-connect': path.join(__dirname, '../src/animachine-connect'),
      'react': path.join(__dirname, '../node_modules/react'),
      'quick-interface': path.join(__dirname, '../../quick-interface/src'),//DEBUG
    }
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        include: [
          path.join(__dirname, '../src'),
          path.join(__dirname, '../../quick-interface/src'), //DEBUG
          __dirname
        ],
        loader: 'babel-loader',
      }, {
        test: /\.(html|css)/,
        include: __dirname,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },
  plugins: []
}
