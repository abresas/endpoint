var express = require( 'express' );
var connect = require( 'connect' );
var createDb = require( './db' ).createDb;
var Resource = require( './resource' );

function createApp() {
    var app = express();
    app.set( 'x-powered-by', 'endpoint' );
    app.set( 'json spaces', 4 );
    // app.set( 'env', 'development' );
    app.use( connect.json() );
    app.db = null;

    var router = express.Router( { strict: true } );
    app.use( router );

    var resources = {};

    app.addSchema = function( schema ) {
        app.db.addCollection( {
            db: schema.db,
            name: schema.name,
            dbCollection: schema.dbCollection,
            properties: schema.properties 
        } );
        var resource = new Resource( schema );
        resource.setupAPI( router );
        resources[ schema.name ] = resource;
    };

    app.model = function( name ) {
        return app.db.collections[ name ];
    };

    app.init = function( opts ) {
        app.listen( opts.server.port );
        console.log( 'endpoint: listening on port', opts.server.port );

        app.db = createDb( opts.databases );
    };

    var YAML = require( 'yamljs' );
    var loadSchemata = require( '../src/schema' ).loadFromDirectory;
    var loadScripts = require( '../src/script' ).loadFromDirectory;
    var fs = require( 'fs' );
    var extend = require( 'util' )._extend;
    app.exec = function() {
        var baseConfig = {
            server: {
                port: 8080
            },
            scriptsDir: "scripts",
            resourcesDir: "resources"
        };
        var exists = fs.existsSync( process.cwd() + '/config.yml' );
        if ( !exists ) {
            console.log( 'endpoint: No config.yml file found. Using default configuration.' );
            var config = baseConfig; 
        }
        else {
            var config = extend( baseConfig, YAML.load( 'config.yml' ) );
        }
        console.log( 'endpoint: using config', config );
        app.init( config );

        loadSchemata( process.cwd() + '/resources/', function( err, schemata ) {
            if ( err ) {
                console.error( err );
                throw "endpoint: Error reading resources directory.";
            }

            schemata.forEach( function( schema ) {
                app.addSchema( schema );
            } );

            loadScripts( process.cwd() + '/' + config.scriptsDir, { app: app }, function( err, scripts ) {
                if ( err ) {
                    console.error( 'endpoint: failed loading scripts.' );
                }
                else if ( !scripts ) {
                    console.error( 'endpoint: no scripts found.' );
                }
                console.log( 'endpoint: scripts loaded' );
            } );

            // This is kind of sad, we have to initialize Waterline
            // after all schemata have been added, because only on initialization
            // we get access to the model objects (which are different than the collections
            // we created earlier.)
            // After we get the list of models, we assign each resource the model it should use
            app.db.init( function( err, models ) {
                if ( err ) {
                    console.error( err );
                    throw "endpoint: Failed to initialize waterline ORM.";
                }
                for ( i in resources ) {
                    if ( !( i.toLowerCase() in models.collections ) ) {
                        throw "endpoint: Failed to initialize model for resource " + i + ".";
                    }
                    resources[ i ].setModel( models.collections[ i.toLowerCase() ] );
                }
            } );
        } );

        return app;
    }

    return app;
}

module.exports = exports = createApp();
