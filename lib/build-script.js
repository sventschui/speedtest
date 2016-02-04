import gulp from 'gulp';
import assign from 'lodash.assign';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import gutil from 'gulp-util';
import source from 'vinyl-source-stream';
import watchify from 'watchify';
import sourcemaps from 'gulp-sourcemaps';

export default function buildScript(script, dest, isDev) {
  const customOpts = {
    entries: [script],
    extensions: ['.jsx'],
    debug: isDev,
  };
  const opts = assign({}, watchify.args, customOpts);
  const b = isDev ? watchify(browserify(opts), { poll: true }) : browserify(opts);

  function bundle() {
    return b.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(dest));
  }

  b.transform(babelify);
  b.on('log', gutil.log); // output build logs to terminal

  if (isDev) {
    b.on('update', bundle); // on any dep update, runs the bundler
  }

  return bundle();
}
