'use strict';

const srcPath = './src/';
const compiledPath = './compiled';
const distPath = './dist';
const templateFilename = 'template.js';
const templateJsHeader = 'require(\'angular\').module(\'<%= module %>\'<%= standalone %>).run([\'$templateCache\', function($templateCache) {';
const templateJsFooter = '}]); module.exports = \'sandbox.html\';';

const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gutil = require('gulp-util');
const gulpSequence = require('gulp-sequence');
const uglify = require('gulp-uglify');
const sourceMaps = require('gulp-sourcemaps');
const templateCache = require('gulp-angular-templatecache');
const jshint = require('gulp-jshint');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sassLint = require('gulp-sass-lint');

const browserify = require('browserify');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const fs = require('fs');
const del = require('del');

let isDistribution = false;

/**
 * Run development environment
 */
gulp.task('dev', ['build', 'serve', 'watch']);

gulp.task('watch', ['serve'], () => {
    gulp.watch(['src/**/*.js'], ['build:js']);
    gulp.watch(['src/**/*.html'], ['build:html']);
    gulp.watch(['src/**/*.scss'], ['build:css']);
});

gulp.task('serve', ['build'], function() {
    connect.server({
        root: srcPath,
        port: 9000,
        livereload: true,
        middleware: function(connect) {
            return [ connect().use('/compiled/', connect.static(compiledPath))];
        }
    });
});

/**
 * Build all javascript
 */
gulp.task('build:js', (done) => {
    gulpSequence('build:app', 'build:vendor')(done);
});

/**
 * Build vendor.js file
 */
gulp.task('build:vendor', (done) => {
    const b = browserify();
    const bundle = b.bundle();
    bundle.on('error', gutil.log)
        .pipe(source('vendor.js'))
        .pipe(buffer())
        .pipe(gulpIf(isDistribution, uglify({mangle: true})))
        .on('error', gutil.log)
        .pipe(gulp.dest(compiledPath + '/js'))
        .on('end', () => {
            done();
        });
});

/**
 * Build app.js file
 */
gulp.task('build:app', (done) => {
    const appEntryPoint = srcPath + '/app.js';
    const b = browserify(appEntryPoint, {debug: true});
    const bundle = b
        .transform('babelify', {
            presets: ['env'],
            compact: true
        }).bundle();

    bundle.on('error', gutil.log)
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(gulpIf(isDistribution, uglify({mangle: false})))
        .on('error', gutil.log)
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest(compiledPath + '/js'))
        .on('end', () => {
            done();
        });
});

/**
 * Run lint tools
 */
gulp.task('lint', ['lint:js', 'lint:scss']);

gulp.task('lint:scss', () => {
    return gulp.src(srcPath + '/**/*.scss')
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
});

gulp.task('lint:js', () => {
    gulp.src([srcPath + '/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

/**
 * Concatenate the contents of all .html files and save to template.js
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

/**
 * Compile the contents of all .scss files and save to main.css
 */
gulp.task('build:css', () => {
    return gulp.src([
        srcPath + '/**/*.scss'])
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(compiledPath + '/style'));
});

/**
 * Clean dist and `compiled` folder
 */
gulp.task('build:clean', () => {
    return del.sync([distPath + '/*', compiledPath + '/*']);
});

/**
 * Lint and compile app sources
 * 1. run 'lint', 'build:clean' in parallel;
 * 2. run 'build:html' and 'build:css' in parallel after 'lint' and 'build:clean';
 * 3. run 'build:js' after 'build:html' and 'build:css'
 */
gulp.task('build', gulpSequence(['lint', 'build:clean'], ['build:html', 'build:css'], 'build:js'));


