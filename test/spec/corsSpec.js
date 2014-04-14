/*global describe, it, Evrythng, expect, beforeEach, sinon, afterEach*/
describe('AJAX',function() {
    'use strict';
    var evth = new Evrythng({
        evrythngApiKey: 'xxxxxxxxxxxx'
    });

    var xhr;

    var methods = [
        {
            name: 'search',
            hmethod: 'GET',
            options: { params: ['casa'] },
            expectUrl: 'https://api.evrythng.com/search?0=casa'
        },
        {
            name: 'createApplication',
            hmethod: 'post',
            options: { params: ['casa'] },
            expectUrl: 'https://api.evrythng.com/applications?0=casa'
        },
        {
            name: 'readApplication',
            hmethod: 'GET',
            options: { params: ['casa'] },
            expectUrl: 'https://api.evrythng.com/applications?0=casa'
        },
        {
            name: 'updateApplication',
            hmethod: 'put',
            options: { params: ['casa'], application: 'app', product: 'prod' },
            expectUrl: 'https://api.evrythng.com/applications/app?0=casa'
        },
        {
            name: 'deleteApplication',
            hmethod: 'delete',
            options: { params: ['casa'], application: 'app', product: 'prod' },
            expectUrl: 'https://api.evrythng.com/applications/app?0=casa'
        },
        {
            name: 'deleteProduct',
            hmethod: 'delete',
            options: { params: ['casa'], application: 'app', product: 'prod' },
            expectUrl: 'https://api.evrythng.com/products/prod?0=casa'
        },
        {
            name: 'updateProduct',
            hmethod: 'put',
            options: { params: ['casa'], application: 'app', product: 'prod' },
            expectUrl: 'https://api.evrythng.com/products/prod?0=casa'
        }
    ];

    var methodCallCors = function( evth, method ){
        var name = method.name;
        var hmethod = method.hmethod;
        var options = method.options;

        describe(name, function() {
            var callback = sinon.spy();

            it( 'calls Evrythng.cors', function() {
                evth[name](options, callback);
                expect( evth.cors.called ).toBeTruthy();
            });
            it( 'doesn\'t call Evrythng.jsonp', function() {
                evth[name]('article', callback);
                expect( evth.jsonp.called ).toBeFalsy();
            });
            it('shows', function() {
                evth[name](options, callback);

                var request = this.requests[0];
                expect(request).toBeDefined();
                expect(request.method).toBe(hmethod);
                expect(request.url).toBe(method.expectUrl);
            });
        });
    };

    it('has a public cors method', function() {
        expect(evth.cors).toBeDefined();
        expect(typeof evth.cors).toBe('function');
        expect(evth.jsonp).toBeDefined();
        expect(typeof evth.jsonp).toBe('function');
    });

    describe('methods',function() {
        beforeEach(function () {
            xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            xhr.onCreate = function (req) { requests.push(req); };
            sinon.spy( evth, 'cors' );
            sinon.spy( evth, 'jsonp' );
        });

        for ( var m in methods ){
            if ( methods.hasOwnProperty( m ) ){
                methodCallCors( evth, methods[m] );
            }
        }

        afterEach( function() {
            xhr.restore();
            evth.cors.restore();
            evth.jsonp.restore();
        });
    });
});
