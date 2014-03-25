var schemaManager = require( './schema' );
var Resource = require( './resource' ).Resource;

function Collection( schema, db ) {
    var resourceSchema = schema.resourceSchema;
    // console.log( schema );
    // console.log( 'collection', schema.dbCollection );
    var dbCollection = null;
    db.collection( schema.dbCollection, function( col ) {
        dbCollection = col;
    } );
    var listeners = {};
    var collection = {};
    collection.schema = schema;
    collection.addEventListener = function( evt, callback ) {
        if ( !listeners[ evt ] ) {
            listeners[ evt ] = [ callback ];
        }
        else {
            listeners[ evt ].push( callback );
        }
    };
    collection.list = function( options, callback ) {
        if ( typeof options == 'function' ) {
            callback = options;
            return collection.addEventListener( 'list', callback );
        }
        dbCollection.find().toArray( callback );
    };
    collection.view = function( callback ) {
        return collection.addEventListener( 'view', callback );
    };
    collection.insert = function( data, callback ) {
        if ( typeof resource == 'function' ) {
            return collection.addEventListener( 'create', resource );
        }
        dbCollection.findOne( {}, { sort: [['id','desc']] }, function( err, last ) {
            if ( err ) { 
                callback( err, null );
            }
            if ( !last ) {
                data.id = 0;
            }
            else {
                data.id = last.id + 1; // TODO: this may not be unique
            }
            dbCollection.insert( data, function( err, results ) {
                if ( err ) {
                    callback( err, null );
                    return;
                }
                var uri = resourceSchema.uri.replace( ':id', data.id );
                var resource = Resource( resourceSchema, collection, data );
                collection.trigger( 'insert', resource );
                callback( err, resource );
            } );
        } );
    };
    collection.find = function( query, callback ) {
        dbCollection.find( query ).toArray( function( err, results ) { 
            var resources = [];
            if ( Array.isArray( results ) ) {
                results.forEach( function( result ) {
                    resources[ i ] = Resource( resourceSchema, collection, result );      
                } );
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
                // console.log( 'result', result );
                var resource = Resource( resourceSchema, collection, result );
                callback( err, resource );
            }
        } );
    };
    collection.remove = function( resource, callback ) {
        if ( typeof resource == 'function' ) {
            return collection.addEventListener( 'delete', resource );
        }
        dbCollection.remove( { 'id': resource.id }, function( err, result ) {
            if ( err ) {
                callback( err, false );
            }
            else {
                collection.trigger( 'remove', resource );
                callback( err, resource );
            }
        } );
    };
    collection.modify = function( resource, callback ) {
        if ( typeof resource == 'function' ) {
            return collection.addEventListener( 'update', resource );
        }
        dbCollection.update( { 'id': resource.id }, resource, function( err, result ) {
            if ( err ) {
                callback( err, false );
            }
            collection.trigger( 'modify', resource );
            callback( err, resource );
        } );
    };
    collection.create = function( callback ) {
        collection.addEventListener( 'create', callback );
    };
    collection.update = function( callback ) {
        collection.addEventListener( 'update', callback );
    };
    collection.delete = function( callback ) {
        collection.addEventListener( 'delete', callback );
    };
    collection.validate = function( callback ) {
        collection.addEventListener( 'validate', callback );
    };
    collection.trigger = function( evt, req, res, resource, next ) {
        // console.log( 'listeners', listeners, 'evt', evt );
        if ( !( evt in listeners ) || !listeners[ evt ].length ) {
            if ( typeof next == 'function' ) {
                next();
            }
        }
        else if ( !res ) {
            // simple event trigger (no req, res, or next)
            // dont wait for callback from listener
            resource = req;
            var l = listeners[ evt ]; 
            for ( i = 0; i < l.length; ++i ) {
                l[ i ]( resource );
            }
        }
        else {
            // complex event trigger, 
            // wait for callback from listener to go to next_listener
            // when the last listener responds, call next (4th parameter to trigger)
            var l = listeners[ evt ];
            var i = 0;
            function next_listener() {
                if ( l[ i ] ) {
                    var listener = l[ i ];
                    i += 1;
                    listener( req, resource, function( code, data ) {
                        if ( code ) {
                            if ( !data ) {
                                data = code;
                                code = 200;
                            }
                            res.send( code, data );
                        }
                        else if ( !code ) {
                            next_listener();
                        }
                    } );
                }
                else {
                    next();
                }
            }
            next_listener();
        }
    };

    return collection;
}

exports.Collection = Collection;
