var path = require('path')
var webpack = require('webpack')

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: path.join(__dirname, 'src/index.js'),
  output: {
    publicPath: '/',
    path: path.join( __dirname, '/browser'),
    filename: 'animachine.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'animachine-connect': path.join(__dirname, 'src/animachine-connect'),
      'react': path.join(__dirname, './node_modules/react'),
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'src'),
        loaders: ['babel-loader']
      }
    ]
  }
}
