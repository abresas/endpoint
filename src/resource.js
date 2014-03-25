function Resource( schema, db ) {
    this.schema = schema;
    this.db = db;
    this._listeners = {};

    this.dbCollection = null;
    var self = this;
    db.collection( schema.dbCollection, function( col ) {
        self.dbCollection = col;
    } );
}

Resource.prototype.list = function( req, res, next ) {
    // console.log( 'list collection', collection );
    if ( typeof req == 'function' ) {
        return this.addEventListener( 'list', req );
    }
    var self = this;
    this.dbCollection.find().toArray( function( err, items ) {
        if ( err ) {
            return res.send( 500, err );
        }
        req.items = items;
        self.trigger( 'list', req, res, items, next );
    } );
};

Resource.prototype.renderList = function( req, res, next ) {
    res.send( req.items );
};

Resource.prototype.validate = function( req, res, next ) {
    // console.log( 'collection insert', req.body );
    if ( typeof req == 'function' ) {
        return this.addEventListener( 'validate', req );
    }
    this.trigger( 'validate', req, res, req.body, next );
};

Resource.prototype.create = function( req, res, next ) {
    // console.log( 'inserting to collection' );
    if ( typeof req == 'function' ) {
        return this.addEventListener( 'create', req );
    }
    var self = this;
    dbCollection.insert( req.body, function( err, item ) {
        if ( err ) {
            return res.send( 500, err );
        }
        req.item = item;
        self.trigger( 'create', req, res, item, next );
    } );
};

Resource.prototype.render = function( req, res, next ) {
    res.send( req.resource );
};

Resource.prototype.initCollectionRequest = function( req, res, next ) {
    req.resource = this;
    next();
};

Resource.prototype.initResourceRequest = function( req, res, next ) {
    // console.log( 'get resource', req.params );
    var query = {};
    var schema = this.schema;
    for ( var i in req.params ) {
        if ( req.params.hasOwnProperty( i ) ) {
            var propertySchema = schema.properties[ i ];
            if ( !propertySchema ) {
                return res.send( 500, { error: "nosuchproperty", message: "No such property " + i + " on resource " + schema.name } );
            }
            if ( propertySchema.type == 'id' || propertySchema.type == 'int' ) {
                query[ i ] = parseInt( req.params[ i ] );
            }
            else if ( propertySchema.type == 'float' ) {
                query[ i ] = parseFloat( req.params[ i ] );
            }
            else {
                query[ i ] = req.params[ i ];
            }
        }
    }
    // console.log( 'finding', query );
    this.dbCollection.findOne( query, function( err, resource ) {
        // console.log( 'found', query, err, resource );
        if ( err ) {
            return res.send( 500, err );
        }
        else if ( !resource ) {
            return res.send( 404, { error: "notfound", message: "Resource not found." } );
        }
        req.resource = resource;
        // console.log( 'resource', resource );
        next();
    } );
};

Resource.prototype.view = function( req, res, next ) {
    if ( typeof req == 'function' ) {
        return this.addEventListener( 'view', req );
    }
    this.trigger( 'view', req, res, req.resource, next );
};

Resource.prototype.replace = function( req, res, next ) {
    // console.log( 'put resource' );
   var resource = req.resource; 
   var self = this;
   this.dbCollection.update( { id: resource.id }, req.body, function( err ) {
       if ( err ) {
           return res.send( err );
       }
       req.resource = resource;
       self.trigger( 'update', req, res, resource, next );
   } );
};

Resource.prototype.update = function( req, res, next ) {
    if ( typeof req == 'function' ) {
        return this.addEventListener( 'update', req );
    }
    // console.log( 'patch resource' );
    
   var resource = req.resource; 
   var self = this;
   for ( var i in req.body ) {
       resource[ i ] = req.body[ i ];
   }
   this.dbCollection.update( { id: resource.id }, resource, function( err ) {
       if ( err ) {
           return res.send( err );
       }
       req.resource = resource;
       self.trigger( 'update', req, res, resource, next );
   } );
};

Resource.prototype.delete = function( req, res, next ) {
    // console.log( 'delete resource' );
    if ( typeof req == 'function' ) {
        return this.addEventListener( 'delete', req );
    }
    var resource = req.resource;
    var self = this;
    this.dbCollection.remove( { id: resource.id }, function( err ) {
        if ( err ) {
            return res.send( 500, err );
        }
        self.trigger( 'delete', req, res, resource, next );
    } );
};

Resource.prototype.addEventListener = function( evt, callback ) {
    if ( !this._listeners[ evt ] ) {
        this._listeners[ evt ] = [ callback ];
    }
    else {
        this._listeners[ evt ].push( callback );
    }
};

Resource.prototype.trigger = function( evt, req, res, resource, next ) {
    // console.log( 'listeners', listeners, 'evt', evt );
    if ( !( evt in this._listeners ) || !this._listeners[ evt ].length ) {
        if ( typeof next == 'function' ) {
            next();
        }
    }
    else if ( !res ) {
        // simple event trigger (no req, res, or next)
        // dont wait for callback from listener
        resource = req;
        var l = this._listeners[ evt ]; 
        for ( i = 0; i < l.length; ++i ) {
            l[ i ]( resource );
        }
    }
    else {
        // complex event trigger, 
        // wait for callback from listener to go to next_listener
        // when the last listener responds, call next (4th parameter to trigger)
        var l = this._listeners[ evt ];
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

exports.Resource = Resource;
