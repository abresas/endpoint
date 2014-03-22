// from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string){
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function Router() {
    var routes = {};
    var notFoundCallback = function() {};
    var router = {
        route: function( url, callback ) {
            if ( !( url in routes ) ) {
                routes[ url ] = [];
            }
            routes[ url ].push( callback );
        },
        clearRoutes: function() {
            routes = {};
        },
        notFound: function( callback ) {
            notFoundCallback = callback;
        },
        trigger: function( url, req, res ) {
            if ( url in routes ) {
                for ( var i = 0; i < routes[ url ].length; ++i ) {
                    routes[ url ][ i ]( req, res );
                    return true;
                }
            }
            for ( u in routes ) {
                r = escapeRegExp( u ).replace( '\\:id', '([0-9]+)', 'g' ).replace( '\\:string', '([^/]+)', 'g' );
                var regex = new RegExp( r + '$' );
                var match = regex.exec( url );
                if ( match ) {
                    for ( var i = 0; i < routes[ u ].length; ++i ) {
                        routes[ u ][ i ]( req, res );
                        return true;
                    }
                }
            }
            notFoundCallback( req, res );
        }
    };
    return router;
};

exports.Router = Router;
