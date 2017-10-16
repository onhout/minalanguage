// grab our gulp packages
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    gwebpack = require('webpack-stream'),
    gs3 = require('gulp-s3-upload'),
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

var config = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

gulp.task("upload", function() {
    gulp.src("./static/**")
        .pipe(gs3(config)({
            Bucket: 'minalanguage', //  Required
            ACL:    'public-read-write'       //  Needs to be user-defined
        }, {
            // S3 Constructor Options, ie:
            maxRetries: 5
        }))
    ;
});

gulp.task('watch', function () {
    gulp.watch(['./src/**'], ['clean-dist', 'webpack']);
});

gulp.task('default', ['watch'], function () {
    return gutil.log('Done')
});