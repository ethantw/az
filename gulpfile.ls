require! {
  gulp
  \vinyl-transform
  \vinyl-source-stream : source
  browserify
  babelify
  \gulp-babel : babel
  \gulp-watch
  \gulp-concat-util : concat
  #\gulp-livescript
  \gulp-react : react
  \gulp-sass : sass
  \gulp-stylus : stylus
}

src = gulp.src
dest = gulp.dest

gulp.task \jsx ->
  browserify {
    entries: \./src/view.jsx
    debug: yes
  }
  .transform babelify
  .bundle!
  .pipe source \./view.js
  .pipe dest \./app/

  /*browserified = vinyl-transform ( file ) ->
    b = browserify file
    b.bundle!
  src \./src/view.jsx
    .pipe babel!
    .pipe browserified
    .pipe concat \view.js
    .pipe dest \./app/
  */

gulp.task \dev <[ jsx ]> ->
  gulp.watch './src/*.jsx' <[ jsx ]>

