var path = require('path')
var webpack = require('webpack')

var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
})

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: [
    // 'webpack-dev-server/client?http://0.0.0.0:5435', // WebpackDevServer host and port
    // 'webpack/hot/only-dev-server',
    './src/index.jsx',
  ],
  output: {
    publicPath: '/',
    path: path.join( __dirname, '/dist'),
    filename: 'index.js'
  },
  resolve: {
    // packageMains: ['main'],
    extensions: ['', '.js', '.jsx'],
    alias: {
      'animachine': path.join(__dirname, '../src/next/index.js'),
      'react-animachine-enhancer': path.join(__dirname, '../src/next/react-animachine-enhancer'),
      'react': path.join(__dirname, '../node_modules/react'),
    }
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        include: [
          path.join(__dirname, '../src'),
          __dirname
        ],
        loader: 'babel',
        // query: {
        //   stage: 0,
        //   plugins: [
        //     'react-transform'
        //   ],
        //   extra: {
        //     'react-transform': [{
        //       target: 'react-transform-hmr',
        //       imports: ['react'],
        //       locals: ['module']
        //     }]
        //   }
        // }
    }, {
        test: /\.(html|css)/,
        include: __dirname,
        loader: 'file?name=[name].[ext]'
      }
    ]
  },
  plugins: [
    definePlugin
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin()
  ]
}
