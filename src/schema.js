var fs = require( 'fs' );
var YAML = require( 'yamljs' );

function ResourceSchema( name, data ) {
    for ( var i in data ) {
        this[ i ] = data[ i ];
    }
    this.name = name;
    this.type = 'resource';

    if ( !this.db ) {
        this.db = 'default';
    }

    // from /foo/bar/:id/:field matches /foo/bar/
    this.baseUri = this.uri.match( /^\/?([^:][^\/]*\/)+/ )[ 0 ]
}

function processSchemaFile( fileData, callback ) {
    var schemata = []
    for ( var i in fileData ) {
        var schema = new ResourceSchema( i, fileData[ i ] );
        schemata.push( schema );
    }
    return schemata;
}

function loadFromDirectory( path, callback ) {
    if ( !callback ) {
        throw 'Second argument to loadFromDirectory must be a function';
    }
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
                        loadedSchemata = processSchemaFile( result );
                        Array.prototype.push.apply( schemata, loadedSchemata );
                        if ( !pending ) callback( false, schemata );
                    } );
                }
                else if ( fileName.slice( -5 ) == '.json' ) {
                    fs.readFile( fileName, function( err, result ) {
                        --pending;
                        if ( result ) {
                            loadedSchemata = processSchemaFile( result );
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
