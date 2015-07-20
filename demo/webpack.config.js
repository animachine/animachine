var path = require('path')
var webpack = require('webpack')

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:5435', // WebpackDevServer host and port
    'webpack/hot/only-dev-server',
    './src/index.jsx',
  ],
  output: {
    publicPath: '/static/',
    path: path.join( __dirname, '/dist'),
    filename: 'index.js'
  },
  resolve: {
    // packageMains: ['main'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      'animachine': path.join(__dirname, '../src/next/index.js'),
      'react-animachine-enhancer': path.join(__dirname, '../src/next/react-animachine-enhancer.js'),
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel']
      }, {
        test: /\.(html|css)/,
        exclude: /node_modules/,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}
