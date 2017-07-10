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
    sass: ['quiz/scss/**/*.scss'],
    index: 'quiz/app/index.html',
    scripts: ['quiz/app/js/app.js', 'quiz/app/js/**/*.js'],
    styles: 'quiz/app/scss/**/*.*',
    templates: 'quiz/app/templates/**/*.*',
    images: 'quiz/app/img/**/*.*',
    lib: 'quiz/www/lib/**/*.*',
    //Destination folders
    destImages: './dist/quiz/img/',
    destTemplates: './dist/quiz/templates/',
    sassSrc: './dist/quiz/scss/ionic.app.scss',
    destSass: './dist/quiz/css/',
    dist: "./dist/quiz",
    scriptBuild: "./dist/quiz/build/",
    cssDist: './dist/quiz/css/',
    libDist: 'dist/quiz/lib'

},
{
    sass: ['imagechat/scss/**/*.scss'],
    index: 'imagechat/app/index.html',
    scripts: ['imagechat/app/js/app.js', 'imagechat/app/js/**/*.js'],
    styles: 'imagechat/app/scss/**/*.*',
    templates: 'imagechat/app/templates/**/*.*',
    images: 'imagechat/app/img/**/*.*',
    lib: 'imagechat/www/lib/**/*.*',
    //Destination folders
    destImages: './dist/imagechat/img/',
    destTemplates: './dist/imagechat/templates/',
    sassSrc: './dist/imagechat/scss/ionic.app.scss',
    destSass: './dist/imagechat/css/',
    dist: "./dist/imagechat",
    scriptBuild: "./dist/imagechat/build/",
    cssDist: './dist/imagechat/css/',
    libDist: 'dist/imagechat/lib'
}];

gulp.task('default', ['sass', 'index', 'scripts', 'styles', 'templates', 'images']);

gulp.task('sass', function () {
  return paths.map(function(path){
    return
        gulp.src(path.sass)
        .pipe(sass())
        .pipe(gulp.dest())
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(path.destSass))
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
        .pipe(concat("app.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.scriptBuild))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.scriptBuild));
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

gulp.task('templates', ['clean-templates'], function () {
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
