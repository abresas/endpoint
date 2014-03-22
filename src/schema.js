var fs = require( 'fs' );
var YAML = require( 'yamljs' );

var schemata = {};
/*

function getSchemaByResource( resourceSchema ) {
    for ( var i in schemata ) {
        var schema = schemata[ i ];
        if ( schema.resource == resourceSchema ) {
            return schema;
        }
    }
    return null;
}

function getSchemaByURI( uri ) {
    for ( var i in schemata ) {
        var schema = schemata[ i ];
        if ( schema.uri == uri ) {
            return schema;
        }
    }
    return null;
}
*/


function handleSchemaFileLoad( loadedSchemata, callback ) {
    for ( var i in loadedSchemata ) {
        var schema = loadedSchemata[ i ];
        schema.name = i;
        schema.type = schema.name.split( '/' )[ 0 ];
        if ( schema.type == 'collection' ) {
            schema.resourceSchema = loadedSchemata[ schema.resource ];
        }
        schemata[ i ] = schema;
        callback( schema );
    }
}

function loadFromDirectory( path, callback ) {
    fs.readdir( path, function( err, files ) {
        if ( err ) {
            console.error( 'Make sure resources directory exists and is readable.' );
        }
        for ( var i = 0; i < files.length; ++i ) {
            var fileName = path + '/' + files[ i ];
            fs.stat( fileName, function( err, stat ) {
                if ( err || !stat ) {
                    console.error( 'Error reading file: ' + fileName + '. Error: ' + err );
                    return;
                }
                if ( stat.isDirectory() ) {
                    loadFromDirectory( fileName ); 
                    return;
                }
                if ( fileName.slice( -4 ) != '.yml' && fileName.slice( -5 ) != '.json' ) {
                    return;
                }
                if ( fileName.slice( -4 ) == '.yml' ) {
                    YAML.load( fileName, function( data ) { handleSchemaFileLoad( data, callback ); } );
                }
                else if ( fileName.slice( -5 ) == '.json' ) {
                    fs.readFile( fileName, function( data ) {
                        handleSchemaFileLoad( JSON.parse( data ), callback );
                    } );
                }
            } );
        }
    } );
}

exports.loadFromDirectory = loadFromDirectory;
