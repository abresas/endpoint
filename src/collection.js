var schemaManager = require( './schema' );
var Resource = require( './resource' ).Resource;

function Collection( schema, db ) {
    var resourceSchema = schema.resourceSchema;
    console.log( schema );
    console.log( 'collection', schema.dbCollection );
    var dbCollection = null;
    db.collection( schema.dbCollection, function( col ) {
        dbCollection = col;
    } );
    var collection = {};
    collection.schema = schema;
    collection.list = function( callback ) {
        dbCollection.find().toArray( callback );
    };
    collection.insert = function( data, callback ) {
        dbCollection.findOne( {}, { sort: [['id','desc']] }, function( err, last ) {
            if ( err ) { 
                callback( err, null );
            }
            data.id = last.id + 1; // TODO: this may not be unique
            dbCollection.insert( data, function( err, results ) {
                if ( err ) {
                    callback( err, null );
                    return;
                }
                var uri = resourceSchema.uri.replace( ':id', data.id );
                var resource = Resource( resourceSchema, this, data );
                callback( false, resource );
            } );
        } );
    };
    collection.find = function( query, callback ) {
        dbCollection.find( query ).toArray( function( err, results ) { 
            var resources = [];
            if ( results.length ) {
                for ( var i = 0; i < results.length; ++i ) {
                    resources[ i ] = Resource( resourceSchema, this, results[ i ] );      
                }
            }
            callback( err, resources );
        } );
    };
    collection.findOne = function( query, callback ) {
        dbCollection.findOne( query, function( err, result ) { 
            if ( err || !result ) {
                callback( err, false );
                return;
            }
            else {
                console.log( 'result', result );
                var resource = Resource( resourceSchema, this, result );
                callback( err, resource );
            }
        } );
    };
    collection.remove = function( resource, callback ) {
        dbCollection.remove( { 'id': resource.id }, function( err, result ) {
            callback && callback( err, resource );
        } );
    };
    collection.update = function( resource, callback ) {
        dbCollection.update( { 'id': resource.id }, resource, function( err, result ) {
            callback && callback( err, resource );
        } );
    };

    return collection;
}

exports.Collection = Collection;
