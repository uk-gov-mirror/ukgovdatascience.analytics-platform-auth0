const gulp = require('gulp');
const inlineCSS = require('gulp-inline-css');
const nunjucksRender = require('gulp-nunjucks-render');
const sass = require('gulp-sass');

gulp.task('sass', () =>
  gulp.src('emails/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('emails/css'))
);

gulp.task('html', () =>
  gulp.src('emails/*.html')
    .pipe(nunjucksRender({
      path: 'emails/templates',
      envOptions: {
        tags: {
          blockStart: '<%',
          blockEnd: '%>',
          variableStart: '<$',
          variableEnd: '$>',
          commentStart: '<#',
          commentEnd: '#>'
        }
      }
    }))
    .pipe(inlineCSS())
    .pipe(gulp.dest('emails/dist'))
);

gulp.task('default', gulp.series('sass', 'html'));
