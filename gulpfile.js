// enable source map support in node stack traces
require("source-map-support").install();

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var babel = require('gulp-babel');
var del = require('del')
var mocha = require("gulp-mocha");
var merge = require("merge2");
var dts = require("dts-concat");
var runSequence = require("run-sequence");
var Baseline = require("baseline");

var tsProject = ts.createProject('./tsconfig.json', {
    typescript: require("typescript")
});

gulp.task('default', function(done) {

    runSequence('build', 'lib', 'test', done);
});

// Performs build without sourcemaps but includes dts files to need to dts-concat in 'lib' task.
gulp.task('build', ['clean'], function() {

    var tsResult = gulp.src(['typings/**/*.ts', 'src/**/*.ts', 'tests/**/*.ts', 'benchmarks/**/*.ts'])
        .pipe(ts(tsProject));

    return merge([
        tsResult.dts.pipe(gulp.dest('build')),
        tsResult.js.pipe(babel({
                presets: [ 'babel-preset-node5' ],
                plugins: [ "transform-es2015-classes" ]
            }))
            .pipe(gulp.dest('build'))
    ]);
});

// Performs build with sourcemaps
gulp.task('debug', ['clean'], function() {

    return gulp.src(['typings/**/*.ts', 'src/**/*.ts', 'tests/**/*.ts', 'benchmarks/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .pipe(babel({
            presets: [ 'babel-preset-node5' ],
            plugins: [ "transform-es2015-classes" ]
        }))
        .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: process.cwd() }))
        .pipe(gulp.dest('build'));
});



gulp.task('clean', function() {
    return del(['build', 'lib']);
});

gulp.task('lib', ['copy-dts'], function(done) {

    var stream = gulp.src(['build/src/**/*.js' ])
        .pipe(gulp.dest('lib'));

    stream.on('end', function() {
        dts.concat({
            name: 'hydrate',
            main: 'build/src/hydrate.d.ts',
            outDir: 'lib/'
        }, done);
    });
});

gulp.task('copy-dts', function() {
    return gulp.src(['typings/**/*.d.ts', 'src/**/*.d.ts' ], { base: './' })
        .pipe(gulp.dest('build'));
});

gulp.task('test', function() {
    return gulp.src('build/tests/**/*.tests.js', {read: false})
        .pipe(mocha());
});

gulp.task('bench', function(done) {

    var baseline = new Baseline();
    baseline.reporter = new Baseline.DefaultReporter();
    baseline.useColors = true;
    baseline.baselinePath = "baseline.json";
    baseline.files = [ "build/benchmarks/sessionImpl.bench.js" ];
    baseline.run(done);
});
// TODO: strip source map comment when creating lib