var fs = require( 'fs' );
var YAML = require( 'yamljs' );

function processSchemata( loadedSchemata, callback ) {
    var schemata = []
    for ( var i in loadedSchemata ) {
        var schema = loadedSchemata[ i ];
        schema.name = i;
        schema.type = schema.name.split( '/' )[ 0 ];
        if ( schema.type == 'collection' ) {
            schema.resourceSchema = loadedSchemata[ schema.resource ];
        }
        schemata.push( schema );
    }
    return schemata;
}

function loadFromDirectory( path, callback ) {
    var schemata = [];
    fs.readdir( path, function( err, files ) {
        if ( err ) {
            callback( { error: 'resourcesdir', message: 'Error reading resources directory ' + path, details: err }, null );
            return;
        }
        var pending = files.length;
        if ( !pending ) callback( false, results );
        files.forEach( function( file ) {
            var fileName = path + '/' + file;
            fs.stat( fileName, function( err, stat ) {
                if ( err || !stat ) {
                    console.error( 'Error reading file: ' + fileName + '. Error: ' + err );
                    return;
                }
                if ( stat.isDirectory() ) {
                    loadFromDirectory( fileName, function( err, results ) {
                        --pending;
                        if ( results ) Array.prototype.push.apply( schemata, results );
                        if ( !pending ) callback( false, schemata );
                    } ); 
                    return;
                }
                if ( fileName.slice( -4 ) != '.yml' && fileName.slice( -5 ) != '.json' ) {
                    --pending;
                    return;
                }
                if ( fileName.slice( -4 ) == '.yml' ) {
                    YAML.load( fileName, function( result ) { 
                        --pending;
                        loadedSchemata = processSchemata( result );
                        Array.prototype.push.apply( schemata, loadedSchemata );
                        if ( !pending ) callback( false, schemata );
                    } );
                }
                else if ( fileName.slice( -5 ) == '.json' ) {
                    fs.readFile( fileName, function( err, result ) {
                        --pending;
                        if ( result ) {
                            loadedSchemata = processSchemata( result );
                            Array.prototype.push.apply( schemata, loadedSchemata );
                        }
                        if ( !pending ) callback( false, schemata );
                    } );
                }
            } );
        } );
    } );
}

exports.loadFromDirectory = loadFromDirectory;
