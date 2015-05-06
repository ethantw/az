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

const WWW = \./_www

src = gulp.src
dest = gulp.dest

gulp.task \server !->
  server = gulp-live-server.static WWW, 7654
  server.start!

gulp.task \app <[ lib html jsx css ]>

gulp.task \dev <[ app server ]> ->
  gulp.watch './app/*.html' <[ html ]>
  gulp.watch './app/*.jsx' <[ jsx ]>
  gulp.watch './app/*.ls' <[ lsc jsx ]>
  gulp.watch './app/css/*.styl' <[ css ]>

gulp.task \lib ->
  src \./app/lib/*
    .pipe dest WWW

gulp.task \jsx ->
  browserify {
    entries: \./app/view.jsx
    debug: yes
  }
  .transform babelify
  .bundle!
  .pipe source \./view.js
  .pipe dest WWW

gulp.task \lsc ->
  src \./app/*.ls
    .pipe gulp-livescript!
    .pipe dest \./app/

gulp.task \css ->
  src \./app/css/index.styl
    .pipe gulp-stylus!
    .pipe concat \style.css
    .pipe dest WWW

gulp.task \html ->
  src \./app/*.html
    .pipe dest WWW

