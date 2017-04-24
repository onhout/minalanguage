// grab our gulp packages
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gwebpack = require('webpack-stream'),
    gautoprefixer = require('gulp-autoprefixer'),
    gless = require('gulp-less'),
    gminifycss = require('gulp-minify-css'),
    gconcat = require('gulp-concat'),
    gdel = require('del'),
    gplumber = require('gulp-plumber');

var errorHandler = function(){
    // default appearance
    return gplumber(function(error){
        // output styling
        gutil.log('|- ' + gutil.colors.bgRed.bold('Build Error in ' + error.plugin));
        gutil.log('|- ' + gutil.colors.bgRed.bold(error.message));
    });
};

gulp.task('clean-dist', function () {
    return gdel([
        './static/dist/*'
    ])
});
gulp.task('webpack', function () {
    return gulp.src('./src/globals/index.js')
        .pipe(errorHandler())
        .pipe(gwebpack(require('./webpack.local.config.js')))
        .pipe(gulp.dest('./static/dist/'));
});

// gulp.task('buildcss', function () {
//     var autoprefixerOptions = {
//         browsers: ['last 2 versions']
//     };
//     var lessOptions = {
//         paths: []
//     };
//
//     return gulp.src('**/static/less/*.less')
//         .pipe(errorHandler())
//         .pipe(gless(lessOptions))
//         .pipe(gconcat('styles.css'))
//         .pipe(gminifycss())
//         .pipe(gautoprefixer(autoprefixerOptions))
//         .pipe(gulp.dest('/static/'))
// });

gulp.task('watch', function () {
    gulp.watch(['./src/**'], ['clean-dist', 'webpack']);
});

gulp.task('default', ['watch'], function () {
    return gutil.log('Done')
});