require! {
  \vinyl-transform
  \vinyl-source-stream : source
  browserify
  babelify
  gulp
  \gulp-babel : babel
  \gulp-uglify
  \gulp-watch
  \gulp-live-server
  \gulp-concat-util : concat
  \gulp-livescript
  \gulp-remarkable
  \gulp-react : react
  #\gulp-sass
  \gulp-stylus
  \gulp-cssmin
  \gulp-gh-pages
}

const WWW     = \./_www/
const CHARSET = '@charset "UTF-8";\n'

src = gulp.src
dest = gulp.dest

gulp.task \deploy <[ min ]> ->
  src \./_www/**/*
    .pipe gulp-gh-pages!

gulp.task \server !->
  server = gulp-live-server.static WWW, 7654
  server.start!

gulp.task \app <[ lib html js css ]>
gulp.task \www <[ data app ]>
gulp.task \min <[ www ]> -> gulp.start <[ html:date uglify cssmin ]>

gulp.task \dev <[ www server ]> ->
  gulp.watch './app/**/*.html'  <[ html ]>
  gulp.watch './*.md'           <[ html ]>
  gulp.watch './app/*.{js,jsx}' <[ js ]>
  gulp.watch './app/css/*.styl' <[ css ]>

gulp.task \lib ->
  src \./app/lib/**/*
    .pipe dest WWW

gulp.task \js ->
  browserify {
    entries: \./app/main.js
    debug: yes
  }
  .add require.resolve \babelify/polyfill
  .transform babelify
  .bundle!
  .pipe source \./main.js
  .pipe dest WWW

gulp.task \uglify ->
  src "#{WWW}/main.js"
    .pipe gulp-uglify {
      output: { ascii_only: yes }
    }
    .pipe dest WWW

gulp.task \css ->
  src \./app/css/index.styl
    .pipe gulp-stylus!
    .pipe concat.header CHARSET
    .pipe concat \style.css
    .pipe dest WWW

gulp.task \cssmin ->
  src "#{WWW}*.css"
    .pipe gulp-cssmin!
    .pipe dest WWW
  src \./app/css/zhuyin.styl
    .pipe gulp-stylus!
    .pipe gulp-cssmin!
    .pipe concat.header CHARSET
    .pipe concat \han.ruby.css
    .pipe dest "#{WWW}201505/"

# Data
gulp.task \data ->
  src \./data/*
    .pipe dest WWW + \data

# Markdown
gulp.task \md <[ md:cp ]>
gulp.task \md:parse ->
  src \./about.md
    .pipe gulp-remarkable preset: \commonmark
    .pipe dest \./

gulp.task \md:cp <[ md:parse ]> ->
  src <[ ./app/template/intro.html ./about.html ./app/template/outro.html ]>
    .pipe concat \about.html
    .pipe dest \./app

# HTML
gulp.task \html <[ html:date ]>
gulp.task \html:cp <[ md ]> ->
  src \./app/*.html
    .pipe dest WWW

  src \./CNAME
    .pipe dest WWW

gulp.task \html:date <[ html:cp ]> ->
  <[ index about ]>
  .forEach ( page ) ->
    src "#{WWW}#{page}.html"
      .pipe concat "#{page}.html", {
        process: ( src ) ->
          src.replace( /\?\{now\}/gi, "?#{Date.now()}" )
      }
      .pipe dest WWW

