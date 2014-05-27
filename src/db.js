var Waterline = require( 'waterline' );

/**
 * Instantiate and configure Waterline ORM.
 *
 * Adds a few methods that make use of the ORM easier and hidden from rest of the code.
 */
function createDb( connections ) {
    var orm = new Waterline();

    var adapters = {};
    for ( var i in connections ) {
        if ( connections.hasOwnProperty( i ) ) {
            var connection = connections[ i ];
            var adapterName = connection.adapter;
            require( 'sails-' + adapterName );
            adapters[ adapterName ] = require( 'sails-' + adapterName );
        }
    }

    var config = {
        adapters: adapters,
        connections: connections,
        defaults: {
            migrate: 'alter'
        }
    };

    // console.log( 'endpoint: using orm config', config );

    orm.init = function( cb ) {
        if ( typeof cb !== "function" ) {
            throw "First parameter to orm.init must be a function.";
        }
        orm.initialize( config, function( err, models ) {
            cb( err, models );
        } );
    };

    orm.addCollection = function( opts ) {
        var listeners = { 
            'afterCreate': [], 'beforeCreate': [],
            'afterValidate': [], 'beforeValidate': [],
            'afterUpdate': [], 'beforeUpdate': [],
            'afterDestroy': [], 'beforeDestroy': []
        };
        var dbCollection = Waterline.Collection.extend( {
            connection: opts.db,
            identity: opts.name,
            tableName: opts.dbCollection,
            attributes: opts.properties,

            /* These methods are called by Waterline.
               We dispatch the events to the listeners attached with on* methods */
            afterCreate: function( item, cb ) {
                this.dispatchEvent( 'afterCreate', item, cb );
            },
            beforeCreate: function( item, cb ) {
                this.dispatchEvent( 'beforeCreate', item, cb );
            },
            afterValidate: function( item, cb ) {
                this.dispatchEvent( 'afterValidate', item, cb );
            },
            beforeValidate: function( item, cb ) {
                this.dispatchEvent( 'beforeValidate', item, cb );
            },
            afterUpdate: function( item, cb ) {
                this.dispatchEvent( 'afterUpdate', item, cb );
            },
            beforeUpdate: function( item, cb ) {
                this.dispatchEvent( 'beforeUpdate', item, cb );
            },
            afterDestroy: function( item, cb ) {
                this.dispatchEvent( 'afterDestroy', item, cb );
            },
            beforeDestroy: function( item, cb ) {
                this.dispatchEvent( 'beforeDestroy', item, cb );
            },
            dispatchEvent: function( evt, item, cb ) {
                var i = 0;
                function next() {
                    if ( i < listeners[ evt ].length ) {
                        var listener = listeners[ evt ][ i ];
                        ++i;
                        listener( item, next );
                    }
                    else {
                        cb();
                        return;
                    }
                } 
                next();
            },

            /* These are called by our library's users (endpoint scripts).
               We just attach functions to events. */
            onCreate: function( cb ) {
                listeners[ 'afterCreate' ].push( cb );
            },
            onBeforeCreate: function( cb ) {
                listeners[ 'beforeCreate' ].push( cb );
            },
            onValidate: function( cb ) {
                listeners[ 'afterValidate' ].push( cb );
            },
            onBeforeValidate: function( cb ) {
                listeners[ 'beforeValidate' ].push( cb );
            },
            onUpdate: function( cb ) {
                listeners[ 'afterUpdate' ].push( cb );
            },
            onBeforeUpdate: function( cb ) {
                listeners[ 'beforeUpdate' ].push( cb );
            },
            onDestroy: function( cb ) {
                listeners[ 'afterDestroy' ].push( cb );
            },
            onBeforeDestroy: function( cb ) {
                listeners[ 'beforeDestroy' ].push( cb );
            }
        } );

        this.loadCollection( dbCollection );

        return dbCollection;
    };


    return orm;
}

exports.createDb = createDb;
