var MongoClient = require( 'mongodb' ).MongoClient;
var EventEmitter = require( 'events' ).EventEmitter;

function Database( dsn ) {
    var mongodb = null;

    var db = new EventEmitter();
    db.connected = false;
    db.collection = function( name, callback ) {
        if ( db.connected ) {
            callback( mongodb.collection( name ) );
        }
        else {
            db.on( 'connect', function() {
                callback( mongodb.collection( name ) );
            } );
        }
    };
    db.connect = function() {
        MongoClient.connect( dsn, function( err, conn ) {
            if ( err ) {
                throw err;
            }
            mongodb = conn;
            db.connected = true;
            db.emit( 'connect' );
        } );
    };

    db.connect();

    return db;
}

exports.Database = Database;
