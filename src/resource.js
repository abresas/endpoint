/**
 * Handle API calls to a specific resource (API).
 *
 * This dispatches HTTP REST calls to the appropriate actions.
 * Similar to Controller in MVC.
 *
 * Options:
 *    baseUri: Uri for the list of items (for example /articles)
 *    uri: Uri for one item (for example /articles/id)
 *    name: The name of this resource (for example Articles)
 */
function Resource( opts ) {
    this.baseUri = opts.baseUri;
    this.uri = opts.uri;
    this.name = opts.name;
    this.type = 'resource';
    this.model = null; // will be set later
}

/**
 * Set database model that will be used.
 */
Resource.prototype.setModel = function( model ) {
    this.model = model;
}

/** 
 * Setup the API calls.
 *
 * This is the code with all the logic for REST calls.
 */
Resource.prototype.setupAPI = function( router ) {
    var self = this;
    console.log( 'endpoint: Setting up ' + this.name + ' API.' );
    router.get( this.baseUri, function( req, res, next ) {
        self.model.find().exec( function( err, items ) {
            if ( err ) throw err;
            res.send( items );
        } );
    } );
    router.post( this.baseUri, function( req, res, next ) {
        console.log( 'create', req.body );
        self.model.create( req.body, function( err, item ) {
            if ( err ) throw err;
            res.send( item );
        } );
    } );
    router.get( this.uri, function( req, res, next ) {
        var query = req.params;
        self.model.findOne( query ).exec( function( err, item ) {
            if ( err ) throw err;
            if ( !item ) return res.send( 404, { "error": "Not found." } );
            res.json( item );
        } );
    } );
    router.put( this.uri, function( req, res, next ) {
        var query = req.params;
        self.model.update( query, req.body, function( err, items ) {
            if ( err ) throw err;
            if ( !items.length ) return res.send( 404, { error: 'No items updated.' } );
            if ( items.length > 1 ) return res.send( 500, { error: 'More than one item updated (' + items.length + '). This should not happen.' } );
            var item = items[ 0 ];
            res.send( item );
        } );
    } );
    router.patch( this.uri, function( req, res, next ) {
        var query = req.params;
        self.model.update( query, req.body, function( err, items ) {
            if ( err ) throw err;
            if ( !items.length ) return res.send( 404, { error: 'No items updated.' } );
            if ( items.length > 1 ) return res.send( 500, { error: 'More than one item updated (' + items.length + '). This should not happen.' } );
            var item = items[ 0 ];
            res.send( item );
        } );
    } );
    router.delete( this.uri, function( req, res, next ) {
        var query = req.params;     
        self.model.destroy( query, function( err, items ) {
            if ( err ) throw err;
            if ( !items.length ) return res.send( 404, { error: 'No items deleted.' } );
            if ( items.length > 1 ) return res.send( 500, { error: 'More than one item updated (' + items.length + '). This should not happen.' } );
            var item = items[ 0 ];
            res.send( item );
        } );
    } );
}

module.exports = exports = Resource;
