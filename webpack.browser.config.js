var path = require('path')

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
      'react-animachine-enhancer': path.join(__dirname, 'src/react-animachine-enhancer'),
      'react': path.join(__dirname, './node_modules/react'),
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'src'),
        loader: 'babel-loader'
      }
    ]
  }
}
