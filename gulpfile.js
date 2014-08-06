'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var rimraf = require('gulp-rimraf');
var size = require('gulp-size');
var watch = require('gulp-watch');
var vulcanize = require('gulp-vulcanize');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var runSequence = require('run-sequence');

var paths = {
  bower: 'bower_components/'
};

gulp.task('clean', function(cb) {

  return gulp.src(['./build/**/*', './build_chrome/**/*'])
    .pipe(rimraf());
});

gulp.task('vendor', function () {
  return gulp.src([
      paths.bower + 'svg.js/dist/svg.js',
    ])
    .pipe(concat('vendor.js'))
    // .pipe($.uglify())
    .pipe(gulp.dest('build'))
    // .pipe(size());
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
  return gulp.src('src/editor/index.html')
    .pipe(vulcanize({dest: 'build'}))
    .pipe(gulp.dest('./build'));
});

gulp.task('init-build-chrome', function () {
  return gulp.src('src/chrome/**/*.*')
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
      .pipe(connect.reload());
  }

  return rebundle();
});

gulp.task('js-chrome', function () {

  var files = ['./build/vendor.js', './build/main.js', './src/chrome/js/content_script_footer.js'];

  watch(files, chromeJs);
  return chromeJs();

  function chromeJs() {
    console.log('chrome js...')
    return gulp.src(files)
      .pipe(concat('content_script.js'))
      .pipe(gulp.dest('./build_chrome/js/'));
  }
});

gulp.task('connect', function() {
  return connect.server({
    root: 'build',
    livereload: true,
    port: 9630
  });
});

gulp.task('watch', function () {

  gulp.watch('./src/editor/windooman/**/*.*', ['imports', 'init-build']);
})

gulp.task('dev',  function (cb) {
  runSequence('clean', ['init-build', 'init-build-chrome'], 'vendor', 'connect', 'js', 'js-chrome', cb);
});