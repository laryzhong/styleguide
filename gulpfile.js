const gulp        = require('gulp');
const less        = require('gulp-less');
// const watch       = require('gulp-watch');
// const prefix      = require('gulp-autoprefixer');
// const plumber     = require('gulp-plumber');
// const livereload  = require('gulp-livereload');
const browserSync = require('browser-sync').create();
const nodemon     = require('gulp-nodemon');

gulp.task('watch', function() {
	gulp.watch('./public/styles/*.less', ['less']); // Watch all the .less files, then run the less task
});

// Static Server + watching scss/html files
gulp.task('serve', [
	'less', 'nodemon'
], function() {

	browserSync.init(null, {
		port        : 5030,
		reloadDelay : 2000,
		proxy       : "localhost:3030"

	});

	gulp.watch("./public/styles/*.less", ['less']);
	gulp.watch("./**/*.ejs").on('change', browserSync.reload);
});

gulp.task('nodemon', function(cb) {

	var started = false;

	return nodemon({script: './server.js'}).on('start', function() {
		// to avoid nodemon being started multiple times
		if (!started) {
			cb();
			started = true;
		}
	});
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('less', function() {
	return gulp.src("./public/styles/style*.less").pipe(less()).pipe(gulp.dest("./public/styles")).pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
