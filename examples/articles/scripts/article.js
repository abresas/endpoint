var articles = collection( 'Articles' );
var sendmail = require( 'sendmail' );
// var article = resource( 'Article' );

articles.load( function( article, callback ) {
    // handle article loaded from database
} );

articles.remove( function( article, callback ) {
} );

articles.create( function( article, callback ) {
    sendmail( {
        subject: 'Article created',
        body: 'Article ' + article.body + ' was created. Follow this link to see it: http://example.org/' + article.uri,
    } );
} );

articles.remove( id );
articles.remove( article );
article.remove();

articles.validate( function( article, callback ) {
    // truthvalues returned means validation passed
    // otherwise return false/null and call callback when ready
    callback( article.title.length > 5 && article.body.length > 10 );
} );

articles.authorizeCreate( function( user, data, callback ) {
} );

articles.authorizeDelete( function( user, article, callback ) {
} );

// handle POST /articles/:id/foo
articles.action( 'foo', 'POST', function( request, response ) {
} );

// handle any request to /articles/:id/bar
articles.action( 'bar', function( request, response ) {
} );

server.on( function( req, res ) {
} );

server.on( '/foo/bar', 'POST', function( req, res ) {
} );
