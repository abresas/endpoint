var fs = require( 'fs' );

function loadFromDirectory( path, callback ) {
    callback = callback || function() {};
    var scripts = [];
    fs.readdir( path, function( err, files ) {
        if ( err ) {
            console.error( 'endpoint: Error reading directory: ' + path + '. Error: ' + err );
            callback( { error: 'scriptsdir', message: 'Error reading scripts dir', details: err } );
            return;
        }
        var pending = files.length;
        if ( !pending ) { callback( false, [] ); };
        files.forEach( function( file ) {
            var fileName = path + '/' + file;
            fs.stat( fileName, function( err, stat ) {
                if ( err || !stat ) {
                    console.error( 'endpoint: Error reading file: ' + fileName + '. Error: ' + err );
                    --pending;
                    if ( !pending ) callback( false );
                    return;
                }
                if ( stat.isDirectory() ) {
                    loadScripts( fileName, function( s ) {
                        --pending;
                        Array.prototype.push.apply( scripts, s );
                        if ( !pending ) callback( false, scripts );
                    } ); 
                    return;
                }
                // console.log( 'script ext ' + fileName.slice( -3 ) );
                if ( fileName.slice( -3 ) == '.js' ) {
                    console.log( 'endpoint: loading script ' + fileName );
                    require( fileName.slice( 0, -3 ) );
                    scripts.push( fileName );
                    --pending;
                    if ( !pending ) callback( false, scripts );
                }
            } );
        } );
    } );
}

exports.loadFromDirectory = loadFromDirectory;
