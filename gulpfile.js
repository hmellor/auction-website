"user strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const babel = require('gulp-babel');
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const concat = require('gulp-concat');
const del = require('del');
const gulp = require('gulp');
const header = require("gulp-header");
const plumber = require("gulp-plumber");
const rename = require('gulp-rename');
const sass = require("gulp-sass");
const terser = require('gulp-terser');

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' */\n',
  '\n'
].join('');

const path = {
  src: {
    js: ['./js/**/*.js', '!./js/**/*.min.js', '!./js/reset.js'],
    css: ['./scss/**/*.scss'],
    html: './**/*.html'
  },
  dest: {
    js: './js/',
    css: './css/'
  }
};

// JS task
function js() {
  return gulp.src(path.src.js, { sourcemaps: true })
    .pipe(babel())
    .pipe(terser())
    .pipe(concat('index.min.js'))
    // .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(path.dest.js));
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.dest.css))
    .pipe(browsersync.stream());
}

// Browsersync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './'
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Watch files
function watchFiles() {
  gulp.watch(path.src.css, css);
  gulp.watch(path.src.js, js);
  gulp.watch(path.src.html, browserSyncReload);
}

// Define complex tasks
const build = gulp.parallel(js, css);
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.default = build;
exports.build = build;
exports.css = css;
exports.watch = watch;
