/*!
 * gulp
 * $ npm install gulp-inject gulp-ruby-sass gulp-compass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */
 
// Load plugins
var gulp = require('gulp'),
  inject = require('gulp-inject'),
  fileinclude = require('gulp-file-include'),
    compass = require('gulp-compass'),
    // sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    source = require('vinyl-source-stream'),
    browserify = require('browserify'),
    babelify = require("babelify"),
    config = require('./config.json');


var runExpress = function() {
  var express = require('express');
  var app = express();
  app.use(express.static(config.dev.root));
  app.listen(4000);
};

gulp.task('dev-fileinclude', function() {
  gulp.src(['./app/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(inject(gulp.src(config.dev.js + '/vendor/modernizr.js', {read: false}), {ignorePath: 'build/dev', name: 'head'}, {relative: false}))
    .pipe(inject(gulp.src(config.dev.js + '/main.js', {read: false}), {ignorePath: 'build/dev', name: 'footer'}, {relative: false}))
    .pipe(inject(gulp.src(config.dev.css + '/main.css', {read: false}), {ignorePath: 'build/dev', name: 'headerCss'}, {relative: false}))
    .pipe(gulp.dest(config.dev.root));
});

gulp.task('prod-fileinclude', function() {
  gulp.src(['./app/*.html', '!./app/parts/*'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(inject(gulp.src(config.prod.js + '/vendor/modernizr.min.js', {read: false}), {ignorePath: 'build/prod', name: 'head'}, {relative: false}))
    .pipe(inject(gulp.src(config.prod.js + '/main.min.js', {read: false}), {ignorePath: 'build/dev', name: 'footer'}, {relative: false}))
    .pipe(inject(gulp.src(config.prod.css + '/main.css', {read: false}), {ignorePath: 'build/dev', name: 'headerCss'}, {relative: false}))
    .pipe(gulp.dest(config.prod.root));
});

gulp.task('dev-styles', function() {
  gulp.src(['./app/sass/*.scss', './app/sass/*.sass'])
    .pipe(compass({
      css: config.dev.css,
      sass: 'app/sass',
      image: config.dev.images,
      require: ['susy', 'modular-scale']
    }))
    .pipe(gulp.dest(config.dev.css))
    .pipe(notify({ message: 'Dev styles task complete' }));
});

gulp.task('prod-styles', function() {
  gulp.src(['./app/sass/*.scss', './app/sass/*.sass'])
    .pipe(compass({
      css: config.prod.css,
      sass: 'app/sass',
      image: config.prod.images,
      require: ['susy', 'modular-scale']
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest(config.prod.css))
    .pipe(notify({ message: 'Prod styles task complete' }));
});


// Scripts
gulp.task('browserify', function() {
  return browserify('app/javascript/app/main.js', { debug: true })
    .transform(babelify)
    .bundle()
    //Pass desired output filename to vinyl-source-stream
    .pipe(source('main.js'))
    // Start piping stream to tasks!
    .pipe(gulp.dest('app/javascript/'));
});

gulp.task('lint', function() {
  return gulp.src('app/javascript/app/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(notify({ message: 'Linting complete' }));
});

gulp.task('dev-scripts', function() {
  return gulp.src('app/javascript/*.js')
    // .pipe(concat('main.js'))
    .pipe(gulp.dest(config.dev.js))
    .pipe(notify({ message: 'Dev scripts task complete' }));
});

gulp.task('prod-scripts', function() {
  return gulp.src('app/javascript/**/*.js')
    // .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(config.prod.js))
    .pipe(notify({ message: 'Prod scripts task complete' }));
});
 
// Images
gulp.task('dev-images', function() {
  return gulp.src('app/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(config.dev.images))
    .pipe(notify({ message: 'Dev images task complete' }));
});

gulp.task('prod-images', function() {
  return gulp.src('app/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(config.prod.images))
    .pipe(notify({ message: 'Prod images task complete' }));
});
 
// Clean
gulp.task('dev-clean', function(cb) {
    del([config.prod.css, config.prod.js, config.prod.images], cb)
});

gulp.task('prod-clean', function(cb) {
    del([config.prod.css, config.prod.js, config.prod.images], cb)
});
 
// Default task
gulp.task('default', ['prod-clean', 'prod-styles', 'prod-scripts', 'prod-images', 'prod-fileinclude'], function() {
    gulp.start('prod-styles', 'prod-scripts', 'prod-images', 'prod-fileinclude');
});
 
// Watch
gulp.task('watch', ['dev-clean', 'lint', 'browserify', 'dev-styles', 'dev-scripts', 'dev-images', 'dev-fileinclude'], function() {

  // Watch .scss/.sass files
  gulp.watch(['./app/sass/**/*.scss', './app/sass/**/*.sass'], ['dev-styles']);
 
  // Watch .js files
  gulp.watch('./app/javascript/**/*.js', ['lint', 'browserify', 'dev-scripts']);
 
  // Watch image files
  gulp.watch('./app/images/**/*', ['dev-images']);
 
  // Watch html files
  gulp.watch('./app/**/*.html', ['dev-fileinclude']);

  // Create LiveReload server
  livereload.listen();
 
  // Watch any files in public/, reload on change
  gulp.watch([config.dev.root]).on('change', livereload.changed);
 
  runExpress();
});
