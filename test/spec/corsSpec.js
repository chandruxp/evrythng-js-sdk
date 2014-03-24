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
            route: 'search',
            hmethod: 'GET',
            options: { params: 'casa' }
        },
        {
            name: 'createApplication',
            route: 'applications',
            hmethod: 'post',
            options: { params: 'casa' }
        },
        {
            name: 'readApplication',
            route: 'applications',
            hmethod: 'GET',
            options: { params: 'casa' }
        },
        {
            name: 'updateApplication',
            route: 'applications',
            hmethod: 'put',
            options: { params: 'casa', application: 'app', product: 'prod' }
        },
        {
            name: 'deleteApplication',
            route: 'applications',
            hmethod: 'delete',
            options: { params: 'casa', application: 'app', product: 'prod' }
        },
        {
            name: 'deleteProduct',
            route: 'products',
            hmethod: 'delete',
            options: { params: 'casa', application: 'app', product: 'prod' }
        },
        {
            name: 'updateProduct',
            route: 'products',
            hmethod: 'put',
            options: { params: 'casa', application: 'app', product: 'prod' }
        }
    ];

    var methodCallCors = function( evth, method ){
        var name = method.name;
        var route = method.route;
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
                evth[name]('article', callback);

                var request = this.requests[0];
                expect(request).toBeDefined();
                expect(request.method).toBe(hmethod);
                expect(request.url).toBe('https://api.evrythng.com/' + route + '?');
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
