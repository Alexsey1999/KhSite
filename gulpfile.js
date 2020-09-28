const gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileInclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass')
autoprefixer = require('gulp-autoprefixer')
gcmq = require('gulp-group-css-media-queries')
cleanCSS = require('gulp-clean-css')
rename = require('gulp-rename')
pathjs = require('path')
uglify = require('gulp-uglify-es').default
babel = require('gulp-babel')
ghPages = require('gh-pages')
imagemin = require('gulp-imagemin')
concat = require('gulp-concat')

const prod_folder = 'dist'
const dev_folder = 'src'

const path = {
  build: {
    html: prod_folder + '/',
    css: prod_folder + '/css',
    js: prod_folder + '/js',
    img: prod_folder + '/images',
    fonts: prod_folder + '/fonts',
  },
  dev: {
    html: [dev_folder + '/*.html', '!' + dev_folder + '/_*.html'],
    scss: dev_folder + '/scss/style.scss',
    css: dev_folder + '/css',
    js: dev_folder + '/js',
    img: dev_folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: dev_folder + '/fonts/*',
    clean: [dev_folder + '/css', dev_folder + '/js/script.min.js'],
  },
  watch: {
    html: dev_folder + '/**/*.html',
    js: dev_folder + '/js/script.js',
    img: dev_folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
    allscss: dev_folder + '/scss/**/*.scss',
  },
  clean_build: './' + prod_folder + '/',
}

function dev_css() {
  return gulp
    .src(path.dev.scss)
    .pipe(scss({ outputStyle: 'expanded' }))
    .pipe(gulp.dest(path.dev.css))
    .pipe(browsersync.stream())
}

function dev_js() {
  return gulp
    .src(['./src/js/script.js'])
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest(path.dev.js))
    .pipe(browsersync.stream())
}

function dev_images() {
  return gulp.src(path.dev.img).pipe(browsersync.stream())
}

function dev_html() {
  return gulp.src(path.watch.html).pipe(browsersync.stream())
}

function dev_clean() {
  return del(path.dev.clean)
}

function prod_css() {
  return gulp
    .src(dev_folder + '/css/**/*.css')
    .pipe(scss({ outputStyle: 'expanded' }))
    .pipe(gcmq())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe(gulp.dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(gulp.dest(path.build.css))
}

function prod_js() {
  gulp.src(dev_folder + '/js/script.js').pipe(gulp.dest(path.build.js))

  return gulp
    .src(dev_folder + '/js/script.min.js')
    .pipe(uglify())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(gulp.dest(path.build.js))
}

function prod_images() {
  return gulp
    .src(path.dev.img)
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 3,
        svgoPlugins: [{ removeViewBox: false }],
      })
    )
    .pipe(gulp.dest(path.build.img))
}

function prod_fonts() {
  return gulp.src(path.dev.fonts).pipe(gulp.dest(path.build.fonts))
}

function prod_html() {
  return gulp
    .src(path.dev.html)
    .pipe(gulp.dest(path.build.html))
    .pipe(browsersync.stream())
}

function prod_clean() {
  return del(path.clean_build)
}

function watchFiles() {
  gulp.watch([path.watch.html], dev_html)
  gulp.watch([path.watch.allscss], dev_css)
  gulp.watch([path.watch.js], dev_js)
  gulp.watch([path.watch.img], dev_images)
}

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + dev_folder + '/',
    },
    notify: false,
  })
}

function deploy(cb) {
  ghPages.publish(pathjs.join(process.cwd(), `./${prod_folder}`), cb)
}

const dev = gulp.series(dev_clean, gulp.parallel(dev_css, dev_js))
const watch = gulp.parallel(dev, watchFiles, browserSync)

const build = gulp.series(
  prod_clean,
  gulp.parallel(prod_html, prod_css, prod_js, prod_images, prod_fonts)
)

// Common tasks
exports.dev = dev
exports.watch = watch

// Deploy (gh-pages)
exports.deploy = deploy

// Development mode
exports.default = watch

// Build application (Production mode)
exports.build = build

// Development tasks
exports.dev_css = dev_css
exports.dev_js = dev_js
exports.dev_images = dev_images
exports.dev_html = dev_html
exports.dev_clean = dev_clean

// Production tasks
exports.prod_css = prod_css
exports.prod_js = prod_js
exports.prod_images = prod_images
exports.prod_fonts = prod_fonts
exports.prod_html = prod_html
exports.prod_clean = prod_clean
