import gulp from 'gulp';
import gulpif from 'gulp-if';
import eslint from 'gulp-eslint';
import jscs from 'gulp-jscs';
import runSequence from 'run-sequence';
import del from 'del';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import webserver from 'gulp-webserver';

import buildScript from './lib/build-script';

let isDev = false;

// === Server ===
gulp.task('server:build', () =>
  gulp.src('./server/src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./dist/server'))
);

// === Client ===
gulp.task('client:html', () => {
  gulp.src('./client/index.html')
    .pipe(gulp.dest('./dist/client'));
});

gulp.task('client:scripts', () => buildScript('./client/app/main.jsx', './dist/client/app', isDev));

gulp.task('client:styles', () =>
  gulp.src('./client/app/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        'node_modules/foundation-sites/scss',
      ],
    }).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist//client/app'))
);

gulp.task('client:build', (cb) => {
  runSequence(['client:html', 'client:scripts', 'client:styles'], cb);
});

gulp.task('client:dev:watch', () => {
  gulp.watch('./client/index.html', () => {
    gulp.start('client:html');
  });

  gulp.watch('./client/app/**/*.js', () => {
    gulp.start('client:scripts');
  });

  gulp.watch('./client/app/**/*.scss', () => {
    gulp.start('client:styles');
  });
});

gulp.task('client:dev:serve', () => {
  gulp.src('./dist/client')
    .pipe(webserver({
      livereload: true,
      port: 3000,
      fallback: 'index.html',
    }));
});

gulp.task('client:dev', () => {
  isDev = true;
  runSequence('client:build', ['client:dev:watch', 'client:dev:serve']);
});

// === Common ===
const lintFiles = [
  './gulpfile.babel.js',
  './lib/**/*.js',
  './server/src/**/*.js',
  './client/app/**/*.{js,jsx}',
];

gulp.task('dev', (cb) => {
  isDev = true;
  runSequence('clean', 'lint', ['dev:watch', 'client:dev'], cb);
});

gulp.task('dev:watch', () => {
  gulp.watch(lintFiles, () => {
    gulp.start('lint');
  });
});

gulp.task('clean', (cb) => {
  del('./dist/**').then(() => cb());
});

gulp.task('lint', () =>
  gulp.src(lintFiles)
    .pipe(eslint())
    .pipe(eslint.format('stylish'))
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(gulpif(!isDev, eslint.failAfterError()))
    .pipe(gulpif(!isDev, jscs.reporter('fail')))
);

gulp.task('build', (cb) => {
  runSequence('clean', 'lint', ['server:build', 'client:build'], cb);
});
