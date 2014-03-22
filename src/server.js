var http = require( 'http' );
var HTTPResponse = require( './httpresponse' ).HTTPResponse;

function Server( router ) {
    var server = http.createServer( function( req, res ) {
        var res = HTTPResponse( res );
        console.log( req.url, req.method );
        var bodyJSON = "";
        req.on( 'data', function( data ) {
            bodyJSON += data;
        } );
        req.on( 'end', function() {
            if ( bodyJSON ) {
                var body = JSON.parse( bodyJSON );
            }
            else {
                var body = {};
            }
            req.body = body;
            router.trigger( req.url, req, res );
        } );
    } );
    return server;
}

exports.Server = Server;
