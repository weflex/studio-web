var gulp = require('gulp');
var browserify = require('browserify');
var bablify = require('babelify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat-css');

gulp.task('default', ['dist/bundle.js', 'dist/index.html', 'dist/style.css']);

gulp.task('dist/bundle.js', function () {
  var bundler = browserify({
    entries: ['app/index.js']
  });
  
  bundler
    .transform(
      bablify,
      { plugins: ['transform-react-jsx'],
        presets: ['es2015', 'stage-0', 'stage-1', 'stage-2', 'stage-3'] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist/index.html', function () {
  gulp
    .src('app/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('dist/style.css', function () {
  gulp
    .src('app/**/*.css')
    .pipe(concat('style.css'))
    .pipe(gulp.dest('dist'));
});

