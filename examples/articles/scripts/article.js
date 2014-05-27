var app = require( '../../../src/app' ); // require( 'endpoint' )
var articles = app.model( 'articles' );

articles.onCreate( function( item, cb ) {
    console.log( 'created', item );
    cb();
} ); 
