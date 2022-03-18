const gulp = require('gulp');

// CSS
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const groupMediaQueries = require('gulp-group-css-media-queries');

// JS
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const browserSync = require('browser-sync').create();

gulp.task('html', function() {
  return gulp.src('index.html')
    .pipe(browserSync.stream());
});

gulp.task('css', function() {
  return gulp.src('sass/main.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe(groupMediaQueries())
    .pipe(postcss([
      autoprefixer({ overrideBrowserslist: ['last 4 versions'] }),
      cssnano()
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream({ match: '**/*.css' }));
});

gulp.task('js', function() {
  return gulp.src('js/main.js')
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.stream());
});

gulp.task('default', gulp.series('html', 'css', function(done) {
  browserSync.init({
    server: {
      baseDir: './'
    },
    notify: false
  });

  gulp.watch('*.html',     gulp.series('html'));
  gulp.watch('sass/**',    gulp.series('css'));
  gulp.watch('js/main.js', gulp.series('js'));
  done();
}));
