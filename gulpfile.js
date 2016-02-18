/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var isProd = false;
var gulp = require('gulp'),
    fs = require('fs'),
    del = require('del'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    gutil = require('gulp-util'),
    babelify = require('babelify'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    streamify = require('gulp-streamify'),
    runSequence = require('run-sequence'),
    license = require('gulp-license'),
    replace = require('gulp-replace'),
    bump = require('gulp-bump'),
    rename = require('gulp-rename'),
    handlebars = require('gulp-compile-handlebars');
var version = null;
var triggerData = JSON.parse(fs.readFileSync('data/data.json'));

function createBundle (url) {
  return browserify({
    entries: [url],
    debug: !isProd
  }).transform(babelify);
}

function watchBundles () {
  var bundleKeys = Object.keys(bundles);
  var watch = null;
  var key = null;
  for (var b = 0; b < bundleKeys.length; b++) {
    key = bundleKeys[b];
    watch = watchify(bundles[key].bundle);
    watch.on('update', buildBundle.bind(this, key));
  }
}

function buildBundle (bundleName) {

  var job = bundles[bundleName];
  var bundle = job.bundle;
  var name = job.name;

  var b = bundle.bundle()
      .on('log', gutil.log.bind(gutil, 'Browserify Log'))
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(name));

  if (isProd) {
    b = b.pipe(streamify(uglify()));
  }

  return b.pipe(license('Apache', {
      organization: 'Google Inc. All rights reserved.'
    }))
    .pipe(gulp.dest('./dist/scripts'));
}

var bundles = {
  'core': {
    url: './src/scripts/css-triggers-core.js',
    name: 'css-triggers-core.js',
    bundle: null
  }
};

/** Clean */
gulp.task('clean', function (done) {
  del(['dist'], done);
});

/** Styles */
gulp.task('styles', function () {
  gulp.src('./src/styles/*.scss')
      .pipe(sass())
      .pipe(minifycss())
      .pipe(license('Apache', {
        organization: 'Google Inc. All rights reserved.'
      }))
      .pipe(gulp.dest('./dist/styles'));
});

/** Scripts */
gulp.task('scripts', function () {
  var bundleKeys = Object.keys(bundles);
  for (var b = 0; b < bundleKeys.length; b++) {
    buildBundle(bundleKeys[b]);
  }
});

/** Root */
gulp.task('root', function () {
  gulp.src('./src/*.*')
    .pipe(replace(/@VERSION@/g, version))
    .pipe(gulp.dest('./dist/'));

  gulp.src('./src/favicon.ico')
    .pipe(gulp.dest('./dist/'));
});

/** HTML */
gulp.task('html', function () {

  gulp.src('./src/**/*.html')
    .pipe(replace(/@VERSION@/g, version))
    .pipe(gulp.dest('./dist/'));
});

/** Images */
gulp.task('images', function () {
  gulp.src('./src/images/**/*.*')
    .pipe(gulp.dest('./dist/images'));
});

/** Third Party */
gulp.task('third_party', function () {
  gulp.src('./src/third_party/**/*.*')
    .pipe(gulp.dest('./dist/third_party'));
});

/** Service Worker */
gulp.task('serviceworker', function () {
  gulp.src('./src/scripts/sw.js')
    .pipe(replace(/@VERSION@/g, version))
    .pipe(replace(/@PROPERTIES@/g, JSON.stringify(Object.keys(triggerData.data))))
    .pipe(gulp.dest('./dist/'));
});

/** Watches */
gulp.task('watch', function () {
  gulp.watch('./src/**/*.scss', ['styles']);
  gulp.watch('./src/*.*', ['root']);
  gulp.watch('./src/**/*.html', ['html']);
  gulp.watch('./src/images/**/*.*', ['images']);
  gulp.watch('./src/third_party/**/*.*', ['third_party']);
  gulp.watch('./src/scripts/sw.js', ['serviceworker']);

  watchBundles();
});

gulp.task('handlebars', function () {
  var counterValue = 1;
  var options = {
    helpers: {

      conditionValue: function (value) {
        if (value === 'initial') {
          return 'Change from default';
        }

        return 'Subsequent updates';
      },

      counter: function () {
        return counterValue++;
      },

      classValue: function (value) {
        var lv = 'x';
        var pv = 'x';
        var cv = 'x';

        if (value.layout !== null) {
          if (value.layout) {
            lv = '1';
          } else {
            lv = '0';
          }
        }

        if (value.paint !== null) {
          if (value.paint) {
            pv = '1';
          } else {
            pv = '0';
          }
        }

        if (value.composite !== null) {
          if (value.composite) {
            cv = '1';
          } else {
            cv = '0';
          }
        }

        return 'l' + lv + ' p' + pv + ' c' + cv;
      }
    }
  };

  return gulp.src('./src/templates/index.hbs')
      .pipe(handlebars(triggerData, options))
      .pipe(rename('index.html'))
      .pipe(gulp.dest('dist'));

});

gulp.task('getversion', function () {
  version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
});

/** Main tasks */

(function () {
  var bundleKeys = Object.keys(bundles);
  var key = null;
  for (var b = 0; b < bundleKeys.length; b++) {
    key = bundleKeys[b];
    bundles[key].bundle = createBundle(bundles[key].url);
  }
})();

var allTasks = ['styles', 'scripts', 'root', 'html', 'images',
    'third_party', 'serviceworker'];

gulp.task('bump', function () {
  return gulp.src('./package.json')
    .pipe(bump({
      type: 'patch'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('default', function () {
  isProd = true;
  return runSequence('clean', 'bump', 'getversion', 'handlebars', allTasks);
});

gulp.task('dev', function () {
  return runSequence('clean', 'getversion', 'handlebars', allTasks, 'watch');
});
