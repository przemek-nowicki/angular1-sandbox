'use strict';

const srcPath = './src/';
const compiledPath = './compiled';
const templateFilename = 'template.js';
const templateJsHeader = 'require(\'angular\').module(\'<%= module %>\'<%= standalone %>).run([\'$templateCache\', function($templateCache) {';
const templateJsFooter = '}]); module.exports = \'sandbox.html\';';

const gulp = require('gulp');

const connect = require('gulp-connect');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sassLint = require('gulp-sass-lint');

const templateCache = require('gulp-angular-templatecache');

const concat = require('gulp-concat');

gulp.task('watch', function () {
    gulp.watch(['src/**/*.html'], ['build:html']);
    gulp.watch(['src/**/*.scss'], ['build:css']);
});

gulp.task('serve', function() {
    connect.server({
        root: srcPath,
        port: 8888,
        livereload: true
    });
});

/**
 * Run development environment
 */
gulp.task('dev', ['serve', 'watch']);

gulp.task('build:css', () => {
    return gulp.src([
        srcPath + '/**/*.scss'])
        .pipe(sass())
        .pipe(concat('app.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(compiledPath + '/style'));
});

gulp.task('lint:scss', () => {
    return gulp.src(srcPath + '/**/*.scss')
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
});

/**
 * Concatenate the contents of all .html-files and save to template.js
 */
gulp.task('build:html', () => {
    return gulp.src([srcPath + '/**/*.html', '!' + srcPath + '/index.html'])
        .pipe(templateCache(templateFilename, {
            module: 'sandbox.html',
            standalone: true,
            templateHeader: templateJsHeader,
            templateFooter: templateJsFooter
        }))
        // TODO: reload only for local env
        .pipe(connect.reload())
        .pipe(gulp.dest(srcPath));
});
