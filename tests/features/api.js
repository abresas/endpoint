var assert = require( "assert" );
var request = require( "supertest" );

describe( 'API', function() {
    var app = require( "../../src/app" );
    process.chdir( 'tests/fixtures/articles/' );
    // require( 'child_process' ).exec( 'endpoint' );
    before( function( done ) {
        app.exec( function() {
            done();
        } );
    } );
    describe( 'GET', function() {
        it( 'should return an empty list when no items are present', function( done ) {
            request( 'http://127.0.0.1:8080/' ).get( '/articles/' ).expect( 200, done );
        } );
    } );
} );
