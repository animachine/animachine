'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var size = require('gulp-size');
var watch = require('gulp-watch');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');

var paths = {
  bower: 'bower_components/'
};

gulp.task('clean', function(cb) {
  rimraf(['./build/**/*', './build_chrome/**/*'], cb);
});

gulp.task('vendor', function () {
  return gulp.src([
      paths.bower + 'svg.js/dist/svg.js',
    ])
    .pipe(concat('vendor.js'))
    // .pipe($.uglify())
    .pipe(gulp.dest('build'))
    .pipe(size());
});

gulp.task('extension', function () {
  return gulp.src('src/chrome_ext/**/*')
    .pipe(gulp.dest('./build'));
});

gulp.task('init-build', ['vendor'], function () {
  gulp.src('src/editor/index.html')
    .pipe(gulp.dest('./build'));

  gulp.src('src/chrome/**/*.*')
    .pipe(gulp.dest('./build_chrome'));

});


gulp.task('js', function () {

  watchify.args.debug = true;
  var bundler = watchify(browserify('./src/editor/main.js', watchify.args));

  bundler.on('update', rebundle);

  function rebundle () {
    return bundler.bundle()
      // log errors if they happen
      .on('error', function(e) {
        gutil.log('Browserify Error', e);
      })
      .pipe(source('main.js'))
      .pipe(gulp.dest('./build'))
      .pipe(connect.reload())

  }

  return rebundle();
});

gulp.task('js-chrome', function () {

  var files = ['build/vendor.js', 'build/main.js', 'src/chrome/js/content_script.js'];

  chromeJs();
  return watch(files, chromeJs);

  function chromeJs() {
    console.log('chrome js...')
    return gulp.src(files)
      .pipe(concat('content_script.js'))
      .pipe(gulp.dest('./build_chrome/js/'));
  }
})

gulp.task('connect', function() {
  connect.server({
    root: 'build',
    livereload: true,
    port: 9630
  });
});

gulp.task('dev',  ['clean', 'init-build', 'connect', 'js-chrome', 'js']);