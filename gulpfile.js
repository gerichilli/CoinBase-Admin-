var gulp = require( 'gulp' );

var rename = require( 'gulp-rename' );
var pug = require( 'gulp-pug-3' );
var scss = require( 'gulp-sass' );
var uglify = require( 'gulp-uglify' );
var autoprefixer = require( 'gulp-autoprefixer' );
var sourcemaps = require( 'gulp-sourcemaps' );
var browserify = require( 'browserify' );
var babelify = require( 'babelify' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var browserSync = require( 'browser-sync' ).create();
// var reload = browserSync.reload;

var pugSRC = './src/**/*.pug';
var htmlDIST = './dist/';

var styleSRC = './src/scss/main.scss';
var styleDIST = './dist/css/';

var jsSRC = 'script.js';
var jsFolder = './src/js/';
var jsDIST = './dist/js';
var jsFILES = [jsSRC];

function browser_sync(){
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    });
}

function reload(done) {
    browser_sync.reload;

    done();
}

function html(done) {
    gulp.src( pugSRC )
        .pipe( pug( {pretty: true} ) )
        .pipe( gulp.dest( htmlDIST ) )
        .pipe(browserSync.stream());
    
    done();
}

function style(done) {
    gulp.src( styleSRC )
        .pipe( scss({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }) )
        .on( 'error', console.error.bind( console ) )
        .pipe( autoprefixer( { 
            overrideBrowserslist: ['last 10 versions'],
            cascade: false
        } ))
        .pipe( rename( 'style.css' ) )
        .pipe( sourcemaps.write( './' ) )
        .pipe( gulp.dest( styleDIST ) )
        .pipe( browserSync.stream() );
    
    done();
}

function js(done) {
    jsFILES.map(function(entry) {
        return browserify({
            entries: [jsFolder + entry]
        })
        .transform( babelify )
        .bundle()
        .pipe( source( entry ) )
        .pipe( buffer() )
        .pipe( sourcemaps.init( { loadMaps: true } ))
        .pipe( uglify() )
        .pipe( sourcemaps.write( './' ))
        .pipe( gulp.dest( jsDIST ))
        .pipe(browserSync.stream());
    });
    
    done();
}

function watch_files() {
    gulp.watch( './src/**/*.pug' , gulp.series(html, reload));
    gulp.watch( './src/scss/**/*.scss' , gulp.series(style, reload));
    gulp.watch( './src/js/**/*.js' , gulp.series(js, reload));
}

gulp.task('html', html);
gulp.task('style', style);
gulp.task('js', js);
gulp.task('default', gulp.parallel(html, style, js));
gulp.task('watch', gulp.parallel(browser_sync, watch_files));