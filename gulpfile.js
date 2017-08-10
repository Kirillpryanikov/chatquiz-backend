var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var htmlmin = require('gulp-htmlmin');
var notify = require("gulp-notify");
var preen = require('preen');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('gulp-autoprefixer');
var path = require('path');
var del = require('del');

var paths = [{
    sass: ['./src/scss/*.scss'],
    index: './src/index.html',
    scripts: ['src/js/app.js', 'src/js/**/*.js', 'src/language/*'],
    styles: 'src/app/scss/**/*.*',
    templates: 'src/templates/**/*.*',
    images: 'src/img/**/*.*',
    lib: 'src/www/lib/**/*.*',
    //Destination folders
    destImages: './dist/img/',
    destTemplates: './dist/templates/',
    destSass: './dist/css',
    dist: "./dist",
    cssDist: './dist/css/',
    libDist: 'dist/lib'
}];

gulp.task('default', ['css', 'index', 'scripts', 'styles', 'templates', 'images']);

gulp.task('css', function () {
  return paths.map(function(path){
    return gulp.src(path.sass)
        .pipe(sass())
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(concat("styles.min.css"))
        .pipe(gulp.dest(path.dist))
  })
});

gulp.task('index', function () {
  return paths.map(function(path){
    return gulp.src(path.index)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.dist));
  })

});

gulp.task('scripts', function () {
  return paths.map(function(path){
    return gulp.src(path.scripts)
        .pipe(sourcemaps.init())
        .pipe(concat("script.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist))
        .pipe(rename('script.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist));
  });
});

gulp.task('styles', function () {
  return paths.map(function(path){
    return gulp.src(path.styles)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer('last 2 version'))
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.cssDist))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifyCss())
        .pipe(gulp.dest(path.cssDist));
  });
});

function MinifyTemplates(path, destPath) {
  return gulp.src(path)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(destPath));
}

gulp.task('templates', function () {
  return paths.map(function(path){
    return MinifyTemplates(path.templates, path.destTemplates);
  })
});

function MinifyImages(path, destPath) {
  return gulp.src(path)
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(destPath));
}

gulp.task('images', ['clean-images'], function () {
  return paths.map(function(path){
    return MinifyImages(path.images, path.destImages);
  })
});

gulp.task('clean-images', function () {
  return paths.map(function(path){
    return del(path.destImages);
  });
});

gulp.task('clean-templates', function () {
  return paths.map(function(path){
    return del(path.destTemplates);
  });
});
