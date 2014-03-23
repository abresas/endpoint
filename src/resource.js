var extend = require( 'util' )._extend;
var schemaManager = require( './schema' );

function Resource( schema, collection, data ) {
    data = data || {};

    var resource = extend( {}, data );
    resource.delete = function( callback ) {
        console.log( 'collection del', collection, collection.delete );
        collection.delete( this, callback );
    };
    resource.update = function( updateData, callback ) {
        for ( i in updateData ) {
            this[ i ] = updateData[ i ];
        }
        collection.update( this, callback );
    };

    return resource;
}

exports.Resource = Resource;
