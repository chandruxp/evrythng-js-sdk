/*global describe, it, Evrythng, expect*/

describe('Prototype methods',function() {
    'use strict';
    it('the Everythng global var exists', function() {
        expect( Evrythng ).toBeDefined();
    });

    var methods = [];
    var crud = ['create', 'read', 'update', 'delete' ];
    var entities = [
        'Application', 'Product', 'ProductProperty', 'ProductRedirector',
        'Thng', 'ThngProperty', 'ThngRedirector', 'ThngLocation',
        'User', 'UserSegment', 'Campaign', 'CampaignRule'
    ];

    // Build method names for entities with all 4 CRUD actions
    for ( var action in crud ){
        if ( crud.hasOwnProperty( action ) ){
            for ( var ent in entities ){
                if ( entities.hasOwnProperty( ent ) ){
                    methods.push( crud[action] + entities[ent] );
                }
            }
        }
    }

    var otherMethods = [
        'search', 'checkin', 'scan', 'share', 'createCollectionThng',
        'readCollectionThng', 'updateCollectionThngProperty', 'updateCollectionThngLocation',
        'deleteCollectionThng', 'readUserStatus', 'updateUserStatus'
    ];

    // Append methods that don't support all 4 CRUD actions to the list
    methods = methods.concat( otherMethods );

    // Function that tests that a method exists as a prototype
    // property of the global Evrythng var
    var methodExistsTest = function( methodName ){
        it( 'The ' + methodName + ' prototype property exists',function() {
            expect( Evrythng.prototype[methodName] ).toBeDefined();
        });
        it( 'and ' + methodName + ' is a method',function() {
            expect( typeof Evrythng.prototype[methodName] ).toBe('function');
        });
    };

    // Testing that ALL methods exist
    describe('Methods exist',function() {
        for ( var m in methods ){
            if ( methods.hasOwnProperty( m ) ){
                methodExistsTest( methods[m] );
            }
        }
    });

    describe('An Everything instance can be created',function() {
        var evth = new Evrythng({
            evrythngApiKey: 'xxxxxxxxxxxx'
        });
        it('can be created', function() {
            expect( evth ).toBeDefined();
        });
        it('is a valid object', function() {
            expect( typeof evth ).toBe('object');
        });
    });

    // Function that tests that a method exists as a prototype
    // property of the evth instance
    var publicMethodExistsTest = function( evth, methodName ){
        it( 'The ' + methodName + ' property exists',function() {
            expect( evth[methodName] ).toBeDefined();
        });
        it( methodName + ' is a method',function() {
            expect( typeof evth[methodName] ).toBe('function');
        });
    };

    // Testing that methods exist and they are met
    describe('For an instance of the Evrythng class',function() {
        var evth = new Evrythng({ evrythngApiKey: 'xxxxxxxxxxxx' });

        for ( var m in methods ){
            if ( methods.hasOwnProperty( m ) ){
                publicMethodExistsTest( evth, methods[m] );
            }
        }
    });

});
