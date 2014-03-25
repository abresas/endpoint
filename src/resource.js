var extend = require( 'util' )._extend;
var schemaManager = require( './schema' );

function Resource( schema, collection, data ) {
    data = data || {};

    var resource = extend( {}, data );
    resource.remove = function( callback ) {
        collection.remove( this, callback );
    };
    resource.modify = function( updateData, callback ) {
        for ( i in updateData ) {
            this[ i ] = updateData[ i ];
        }
        collection.modify( this, callback );
    };

    return resource;
}

exports.Resource = Resource;
