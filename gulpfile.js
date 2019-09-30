const babel = require('gulp-babel');
// const rename = require('gulp-rename');
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const terser = require('gulp-terser');
const browserSync = require('browser-sync');

const server = browserSync.create();

const paths = {
  scripts: {
    src: ['./js/**/*.js', '!./js/**/*.min.js', '!./js/reset.js'],
    dest: './js/'
  }
};

const clean = () => del(['dist']);

function scripts() {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(terser())
    .pipe(concat('index.min.js'))
    // .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.scripts.dest));
}

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: './'
    }
  });
  done();
}

const watch = () => gulp.watch(paths.scripts.src.concat(['./css/**/*.css', './index.html']), gulp.series(scripts, reload));

const dev = gulp.series(clean, scripts, serve, watch);
exports.default = dev;
