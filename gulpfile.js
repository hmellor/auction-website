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
    .pipe(gulp.dest("./css"))
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
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*", "!./js/**/*.min.js"], js);
  gulp.watch("./**/*.html", browserSyncReload);
}

const build = gulp.parallel(scripts, css)
const watch = () => gulp.watch(paths.scripts.src.concat(['./css/**/*.css', './index.html']), gulp.series(scripts, browserSyncReload));

const dev = gulp.series(clean, scripts, css, browserSync, watch);

// Export tasks
exports.default = build;
exports.build = build;
exports.css = css;
exports.watch = dev;
