"use strict";

const gulp = require( "gulp" );

gulp.task( "readme", () => {
  return gulp.src( [ "README.md" ] ).pipe( gulp.dest( "dist/swift-layout" ) );
} );
