var YAML = require( 'yamljs' );
var loadSchemata = require( './schema' ).loadFromDirectory;
var loadScripts = require( './script' ).loadFromDirectory;
var extend = require( 'util' )._extend;
var Resource = require( './resource' ).Resource;
var DBSchema = require( 'jugglingdb' ).Schema;
var express = require( 'express' );
var fs = require( 'fs' );

function setupAPI( app, resource, db ) {
    var schema = resource.schema;
    console.log( 'endpoint: registering collection uri ' + schema.baseUri );
    app.all( schema.baseUri, resource.initCollectionRequest.bind( resource ) );
    app.get( schema.baseUri, resource.list.bind( resource ) );
    app.get( schema.baseUri, resource.renderList.bind( resource ) );
    app.post( schema.baseUri, resource.validate.bind( resource ) );
    app.post( schema.baseUri, resource.create.bind( resource ) );
    app.post( schema.baseUri, resource.render.bind( resource ) );

    console.log( 'endpoint: registering resource uri', schema.uri );
    app.all( schema.uri, resource.initResourceRequest.bind( resource ) );
    app.get( schema.uri, resource.view.bind( resource ) );
    app.get( schema.uri, resource.render.bind( resource ) );
    app.put( schema.uri, resource.validate.bind( resource ) );
    app.put( schema.uri, resource.replace.bind( resource ) );
    app.put( schema.uri, resource.render.bind( resource ) );
    app.patch( schema.uri, resource.validate.bind( resource ) );
    app.patch( schema.uri, resource.update.bind( resource ) );
    app.patch( schema.uri, resource.render.bind( resource ) );
    app.delete( schema.uri, resource.delete.bind( resource ) );
    app.delete( schema.uri, resource.render.bind( resource ) );

    app.set( 'resource/' + schema.name, resource );
}

express.application.resource = function( name ) {
    return this.get( 'resource/' + name );
};

express.application.run = function() {
    var app = this;
    app.use( express.bodyParser() );
    app.use( function( req, res, next ) {
        res.header( 'X-Powered-By', 'Endpoint' );
        next();
    } );

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
    var collections = {};
    var databases = {};
    console.log( 'endpoint: loading schemata' );
    loadSchemata( config.resourcesDir, function( err, schemata ) {
        if ( !schemata ) {
            console.error( 'endpoint: no resources found.' );
        }
        else {
            schemata.forEach( function( schema ) {
                if ( !( schema.db in config.databases ) ) { // check if this db is configured
                    console.err( 'No such db "' + schema.db + '" specified in configuration file.' );
                    process.exit();

                }
                else if ( !( schema.db in databases ) ) { // first model with this db, connect
                    var dbConfig = config.databases[ schema.db ]
                    databases[ schema.db ] = new DBSchema( dbConfig.adapter, dbConfig );
                }
                db = databases[ schema.db ];
                if ( !db.adapter ) {
                    console.error( 'Could not initialize db "' + schema.db + '". You may need to install jugglingdb ' + dbConfig.adapter + ' adapter.' );
                    process.exit();
                }
                var resource = new Resource( schema, db );
                resource[ schema.name ] = resource;
                setupAPI( app, resource, db );
            } );
        }
        console.log( 'endpoint: loading scripts' );
        loadScripts( config.scriptsDir, function( err, scripts ) {
            if ( err ) {
                console.error( 'endpoint: failed loading scripts.' );
            }
            else if ( !scripts ) {
                console.error( 'endpoint: no scripts found.' );
            }
        } );
    } );
    app.listen( config.server.port );
    console.log( 'endpoint: listening on port', config.server.port );
}
var app = express();

module.exports = exports = app;
