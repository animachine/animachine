var path = require('path')

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: path.join(__dirname, 'src/scripts/content-script.js'),
  output: {
    publicPath: '/',
    path: path.join( __dirname, '/build/scripts'),
    filename: 'content-script.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'animachine': path.join(__dirname, '../src/next/index.js'),
      'react-animachine-enhancer': path.join(__dirname, '../src/next/react-animachine-enhancer'),
      'react': path.join(__dirname, '../node_modules/react'),
      'custom-drag': 'react-matterkit/lib/custom-drag',
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.join(__dirname, '../src'),
          __dirname
        ],
        loader: 'babel'
      }
    ]
  }
}
