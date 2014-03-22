var extend = require( 'util' )._extend;
var schemaManager = require( './schema' );

function Resource( schema, collection, data ) {
    data = data || {};

    var resource = extend( {}, data );
    resource.remove = function( callback ) {
        collection.remove( this, callback );
    };
    resource.update = function( updateData, callback ) {
        for ( i in updateData ) {
            this[ i ] = updateData[ i ];
        }
        collection.update( this );
    };

    return resource;
}

exports.Resource = Resource;
