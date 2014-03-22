var YAML = require( 'yamljs' );
var fs = require( 'fs' )
var querystring = require( 'querystring' );
var schemaManager = require( './schema' );
var dbManager = require( './db' );
var extend = require( 'util' )._extend;
var Collection = require( './collection' ).Collection;
var Server = require( './server' ).Server;
var Router = require( './router' ).Router;

function handleRequest( collection, req, res ) {
    function handleDatabaseUpdate( err, resource ) {
        if ( err ) {
            res.error( err );
            return;
        }
        res.send( resource );
    }

    var url = req.url;
    var parts = url.split( '/' ).slice( 1 );
    if ( parts.length == 2 ) {
        var id = parseInt( parts[ 1 ] );
        console.log( 'type: resource' );
        collection.findOne( { id: id }, function( err, resource ) {
            console.log( 'find: ', err, resource );
            if ( err ) {
                res.error( err );
            }
            if ( !resource ) {
                err = { error: "notfound", message: "Resource not found." };
                res.error( err );
            }
            else if ( req.method == 'DELETE' ) {
                resource.remove( handleDatabaseUpdate );
            }
            else if ( req.method == 'PUT' ) {
                resource.update( req.body, handleDatabaseUpdate );
            }
            else if ( req.method == 'GET' ) {
                res.send( resource );
            }
            else {
                res.send( { error: 'unknownmethod', message: 'Method ' + req.method + ' not allowed.' } );
            }
        } );
    }
    else {
        if ( req.method == 'GET' ) {
            console.log( 'list collection', collection );
            collection.list( handleDatabaseUpdate );
        }
        else if ( req.method == 'POST' ) {
            console.log( 'collection insert', req.body );
            collection.insert( req.body, handleDatabaseUpdate );
        }
        else {
            res.error( { error: 'unknownmethod', message: 'Method ' + req.method + ' not allowed.' } );
        }
    }
}

function run() {
    var router = Router();
    router.notFound( function( req, res ) {
        err = { error: "notfound", message: "Invalid endpoint." };
        res.error( err );
    } );

    var server = Server( router );

    var config = YAML.load( 'config.yml' );
    console.log( 'config', config );
    var collections = {};
    var db = dbManager.Database( 'mongodb://' + config.database.host + '/' + config.database.name );
    schemaManager.loadFromDirectory( 'resources', function( schema ) {
        if ( schema.type == 'collection' ) {
            var collection = Collection( schema, db );
            router.route( schema.uri, handleRequest.bind( server, collection ) );
            router.route( schema.resourceSchema.uri, handleRequest.bind( server, collection ) );
            collections[ schema.name ] = collection;
        }
    } );
    server.listen( '8080' );
}

run();
