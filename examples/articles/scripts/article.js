var app = require( '../../../src/app' );
var articles = app.get( 'collection/Articles' );

articles.validate( function( req, res, resource, next ) {
    console.log( 'articles.js validate' );
    next();
} );

articles.create( function( req, res, resource, next ) {
    console.log( 'articles.js create' );
    next();
} );

articles.delete( function( req, res, resource, next ) {
    console.log( 'articles.js delete' );
    next();
} );

articles.update( function( req, res, resource, next ) {
    console.log( 'articles.js update' );
    next();
} );

console.log( 'articles.js loaded' );

