require! {
  \vinyl-transform
  \vinyl-source-stream : source
  browserify
  babelify
  gulp
  \gulp-babel : babel
  \gulp-watch
  \gulp-live-server
  \gulp-concat-util : concat
  \gulp-livescript
  \gulp-react : react
  \gulp-sass
  \gulp-stylus
}

const WWW = \./_www/
const COMPILED = WWW + \tmp/

src = gulp.src
dest = gulp.dest

gulp.task \server !->
  server = gulp-live-server.static WWW, 7654
  server.start!

gulp.task \app <[ lib html jsx css ]>
gulp.task \www <[ data app ]>

gulp.task \dev <[ www server ]> ->
  gulp.watch './app/*.html' <[ html ]>
  gulp.watch './app/*.{js,jsx}' <[ jsx ]>
  gulp.watch './app/css/*.styl' <[ css ]>

gulp.task \lib ->
  src \./app/lib/*
    .pipe dest WWW

gulp.task \es6 ->
  src \./app/*.js
    .pipe babel!
    .pipe dest COMPILED
  src \./app/*.jsx
    .pipe dest COMPILED

gulp.task \jsx ->
  browserify {
    entries: \./app/view.jsx
    debug: yes
  }
  .add require.resolve \babelify/polyfill
  .transform babelify
  .bundle!
  .pipe source \./main.js
  .pipe dest WWW

gulp.task \css ->
  src \./app/css/index.styl
    .pipe gulp-stylus!
    .pipe concat \style.css
    .pipe dest WWW

gulp.task \data ->
  src \./data/*
    .pipe dest WWW + \data

gulp.task \html ->
  src \./app/*.html
    .pipe dest WWW

