'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var rimraf = require('gulp-rimraf');
var size = require('gulp-size');
var watch = require('gulp-watch');
var zip = require('gulp-zip');
var uglify= require('gulp-uglify');
var vulcanize = require('gulp-vulcanize');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var runSequence = require('run-sequence');
var stringify = require('stringify');

var paths = {
  bower: 'bower_components/',
  node: 'node_modules/',
  assets: 'src/editor/assets/',
};

gulp.task('clean', function(cb) {

  return gulp.src(['./build/**/*.*'])
  // return gulp.src(['./build/**/*.*', './build_chrome/**/*.*'])
    .pipe(rimraf());
});

gulp.task('vendor', function () {
  return gulp.src([
      paths.assets + 'js/webfont.js',
      paths.node + 'css.escape/css.escape.js',
      paths.bower + 'lodash/dist/lodash.min.js',
      paths.bower + 'velocity/velocity.js',
      paths.bower + 'jquery/dist/jquery.js',
      paths.bower + 'mustache/mustache.js',
      paths.bower + 'codemirror/lib/codemirror.js',
      paths.bower + 'codemirror/mode/javascript/javascript.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
    .pipe(size());
});

gulp.task('extension', function () {
  return gulp.src('src/chrome_ext/**/*')
    .pipe(gulp.dest('./build'));
});

gulp.task('imports', function () {
  return gulp.src('src/editor/imports.html')
    .pipe(vulcanize({dest: 'build_chrome/'}))
    .pipe(gulp.dest('./build_chrome'));
});

gulp.task('init-build', function () {
  return gulp.src([
    './src/editor/index.html', paths.assets + '**/*.*'], {base:'./src/editor/'})
    // .pipe(vulcanize({dest: 'build'}))
    .pipe(gulp.dest('./build'));
});

gulp.task('init-build-chrome', function () {
  return gulp.src('src/chrome/**/*.*')
    .pipe(gulp.dest('./build_chrome'));
});

gulp.task('init-build-chrome-assets', function () {
  return gulp.src('src/editor/assets/**/*.*')
    .pipe(gulp.dest('./build_chrome/assets'));
});


gulp.task('js', function () {

  watchify.args.debug = true;
  var bundler = watchify(browserify('./src/editor/main.js', watchify.args))
    .transform(stringify(['.css', '.mst']));

  bundler.on('update', rebundle);

  function rebundle () {
    console.log('rebundle...')
    return bundler.bundle()
      // log errors if they happen
      .on('error', function(e) {
        gutil.log('Browserify Error', e);
      })
      .pipe(source('main.js'))
      .pipe(gulp.dest('./build'))
      .pipe(connect.reload());
  }

  return rebundle();
});

gulp.task('css', function () {

  return gulp.src([
    paths.bower + 'codemirror/lib/codemirror.css',
    paths.bower + 'codemirror/theme/pastel-on-dark.css'
  ])
    .pipe(concatCss('am.css'))
    .pipe(gulp.dest('src/editor/'));
});

gulp.task('js-chrome', function () {

  var files = ['./build/vendor.js', './build/main.js', './src/chrome/js/content_script_footer.js'];

  return gulp.src(files)
    .pipe(watch(function () {
      console.log('chrome js...')
      return gulp.src(files)
        .pipe(concat('content_script.js'))
        .pipe(gulp.dest('./build_chrome/js/'));
    }));
});

gulp.task('connect', function() {
  return connect.server({
    // root: 'build',
    livereload: true,
    port: 9630
  });
});


gulp.task('dev',  function (cb) {
  runSequence('clean', 'css', ['init-build', 'init-build-chrome'], 'init-build-chrome-assets', 'vendor', 'connect', 'js', 'js-chrome', cb);
});

gulp.task('zip', function () {
    return gulp.src('build_chrome/**/*.*')
        .pipe(zip('build_chrome.zip'))
        .pipe(size())
        .pipe(gulp.dest('./'));
});