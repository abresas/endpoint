var app = require( '../../../src/app' );
var articles = app.resource( 'Article' );

articles.view( function( req, resource, next ) {
    console.log( 'articles.js view' );
    next();
} );

articles.list( function( req, resource, next ) {
    console.log( 'articles.js list' );
    next();
} );

articles.validate( function( req, resource, next ) {
    console.log( 'articles.js validate' );
    next();
} );

articles.create( function( req, resource, next ) {
    console.log( 'articles.js create' );
    next();
} );

articles.delete( function( req, resource, next ) {
    console.log( 'articles.js delete' );
    next();
} );

articles.update( function( req, resource, next ) {
    console.log( 'articles.js update' );
    next();
} );

console.log( 'articles.js loaded' );
