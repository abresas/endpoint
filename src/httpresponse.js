/* Wrapper around nodejs response object providing higher-level functions */
function HTTPResponse( _impl ) {
    return {
        error: function( err ) {
            var statusCode;
            if ( err.statusCode ) {
                statusCode = err.statusCode;
            }
            else if ( err.error == 'notfound' ) {
                statusCode = 404; 
            }
            else if ( err.error == 'unknownmethod' ) {
                statusCode = 405;
            }
            else {
                statusCode = 500;
            }
            _impl.writeHead( statusCode, { 'Content-type': 'application/json' } );
            _impl.end( JSON.stringify( err ) );
        },
        send: function( obj, statusCode ) {
            statusCode = statusCode || 200;
            _impl.writeHead( statusCode, { 'Content-type': 'application/json' } );
            _impl.end( JSON.stringify( obj ) );
        }
    };
}

exports.HTTPResponse = HTTPResponse;
