var gulp = require("gulp");
var clean = require("del");
var plumber = require("gulp-plumber");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgmin = require("gulp-svgmin");
var svgstore = require("gulp-svgstore");
var run = require("run-sequence");
var server = require("browser-sync").create();

// Clean CSS before compiling
gulp.task("clean", function() {
  return clean(["../build"], { force: true });
});

gulp.task("bootstrap", function() {
  return gulp.src([
      'node_modules/bootstrap/dist/js/bootstrap.js',
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/jquery/dist/jquery.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/tether/dist/js/*.js',
      'node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('js/'));
});

// Copy all files into build folder
gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*.{woff,woff2}",
      "img/**",
      "js/**",
      "*.html"
    ], {
      base: "."
    })
    .pipe(gulp.dest("../build"));
});

// Compiles SCSS files from /scss into /css
gulp.task("style", function() {
  return gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          "last 2 version"
        ]
      }),
      mqpacker({
        sort: false
      })
    ]))
    .pipe(gulp.dest("../build/css"))
    .pipe(minify({
      restructure: false,
      debug: true
    }))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("../build/css"))
    .pipe(server.stream());
});

gulp.task("html", function() {
  return gulp.src([
      "*.html"
    ], {
      base: "."
    })
    .pipe(gulp.dest("../build"))
    .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src("../build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.jpegtran({ progressive: true })
    ]))
    .pipe(gulp.dest("../build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("../build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("../build/img"));
});

// Default task
gulp.task("build", function(fn) {
  run(
    "clean",
    "bootstrap",
    "copy",
    "style",
    "images",
    "symbols",
    fn
  );
});

// Configure the browserSync task
gulp.task("serve", function() {
  server.init({
    server: "../build",
    notify: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html", ["html"]);
  gulp.watch('*.html', server.reload);
});