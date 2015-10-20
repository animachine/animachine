var gulp = require('gulp')
var gutil = require('gulp-util')
var size = require('gulp-size')
var zip = require('gulp-zip')
var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var demoWebpackConfig = require('./demo/webpack.config.dev.js')
var browserWebpackConfig = require('./webpack.browser.config.dev.js')
var ghPages = require('gulp-gh-pages')


gulp.task('default', ['webpack-dev-server'])

gulp.task('webpack-dev-server', function(callback) {
	// modify some webpack config options
	var myConfig = Object.create(demoWebpackConfig)
	myConfig.devtool = '#eval-source-map'
	myConfig.debug = true

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(myConfig), {
		publicPath: '/',//myConfig.output.publicPath,
    // hot: true,
    historyApiFallback: true,
		stats: {
			colors: true
		}
	}).listen(5435, 'localhost', function(err) {
		if(err) throw new gutil.PluginError('webpack-dev-server', err)
		gutil.log('[webpack-dev-server]', 'http://localhost:5435/webpack-dev-server/index.html')
	})
})

gulp.task('pack-extension', function () {
  return gulp.src('chrome/src/**/*.*')
    .pipe(zip('build_chrome.zip'))
    .pipe(size())
    .pipe(gulp.dest('./'))
})


// gulp.task('build-browser', function (callback) {
//   webpack(browserWebpackConfig, function(err, stats) {
// 		if(err) throw new gutil.PluginError('build-demo', err)
// 		gutil.log('[webpack:build]', stats.toString({
// 			colors: true
// 		}))
// 		callback()
// 	})
// })

gulp.task('serve-browser', function(callback) {
	// modify some webpack config options
	var myConfig = Object.create(browserWebpackConfig)
	myConfig.devtool = '#eval-source-map'
	myConfig.debug = true

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(myConfig), {
		publicPath: '/',//myConfig.output.publicPath,
    // hot: true,
    historyApiFallback: true,
		stats: {
			colors: true
		}
	}).listen(5436, 'localhost', function(err) {
		if(err) throw new gutil.PluginError('webpack-dev-server', err)
		gutil.log('[webpack-dev-server]', 'http://localhost:5436/webpack-dev-server/index.html')
	})
})
