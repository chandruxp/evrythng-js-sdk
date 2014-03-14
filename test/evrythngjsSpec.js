/*global describe, it, Evrythng, expect, beforeEach*/
describe('Testing baby',function() {
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

    methods = methods.concat( otherMethods );

    var methodExistsTest = function( methodName ){
        it( 'The ' + methodName + ' prototype property exists',function() {
            expect( Evrythng.prototype[methodName] ).toBeDefined();
        });
        it( methodName + ' is a method',function() {
            expect( typeof Evrythng.prototype[methodName] ).toBe('function');
        });
    };

    // Testing that methods exist and they are met
    describe('Methods exist',function() {
        for ( var m in methods ){
            if ( methods.hasOwnProperty( m ) ){
                methodExistsTest( methods[m] );
            }
        }
    });

    var xhr;
    describe('Methods exist',function() {
        it('sinon global exists', function() {
            expect(sinon).toBeDefined();
            console.log(JSON.stringify(sinon));
            expect(sinon.spy).toBeDefined();
            expect(sinon.useFakeXMLHttpRequest).toBeDefined();

        });
        beforeEach(function () {
            //xhr = sinon.useFakeXMLHttpRequest();
            //requests = [];
            // xhr.onCreate = function (req) { requests.push(req); };
        });
        for ( var m in methods ){
            if ( methods.hasOwnProperty( m ) ){
                methodExistsTest( methods[m] );
            }
        }
    });
});
