
var gulp = require("gulp");
var del = require("del");
var sequence = require("gulp-sequence");
var typescript = require("gulp-typescript");
var json = require('gulp-json-editor');

gulp.task("clean:build", function() {
    return del(["build"]);
});

gulp.task("clean:package", function() {
    return del(["package"]);
});

gulp.task("clean", sequence("clean:build", "clean:package"));

gulp.task("build:typescript", function () {
    var config = typescript.createProject("./tsconfig.json");

    return gulp
        .src("src/**/*.ts")
        .pipe(config())
        .pipe(gulp.dest("build"));
});

gulp.task("watch", function () {
    gulp.watch("src/**/*.ts", ["build:typescript"]);
});

gulp.task("package:copy", function () {
    return gulp.src('build/main/**/*')
        .pipe(gulp.dest('package/src'));
});

gulp.task('package:license', function() {
    return gulp.src('./LICENSE.txt')
        .pipe(gulp.dest('package'));
});

gulp.task('package:readme', function() {
    return gulp.src('./README.md')
        .pipe(gulp.dest('package'));
});

gulp.task("package:doc", function () {
    return gulp.src('doc/**/*')
        .pipe(gulp.dest('package/doc'));
});

gulp.task("package:package.json", function () {
    return gulp.src('package.json')
        .pipe(json({
            main: 'src/index.js',
            types: 'src/index.d.ts'
        }))
        .pipe(gulp.dest('package'));
});

gulp.task("build", sequence("clean:build", "build:typescript"));

gulp.task("package", sequence(
    "clean", "build", "package:copy", "package:license",
    "package:readme", "package:package.json", "package:doc"
));
