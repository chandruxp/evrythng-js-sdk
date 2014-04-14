/*global describe, it, Evrythng, expect, beforeEach, sinon, afterEach*/
describe('Public methods behaviour',function() {
    'use strict';
    var evth = new Evrythng({
        evrythngApiKey: 'xxxxxxxxxxxx'
    });

    var methods = [
        {
            name: 'search',
            url: ''
        },
        {
            name: 'checkin',
            url: ''
        },
        {
            name: 'createApplication',
            url: ''
        },
        {
            name: 'readApplication',
            url: ''
        },
        {
            name: 'updateApplication',
            url: ''
        },
        {
            name: 'deleteApplication',
            url: ''
        }
    ];

    var xhr;

    var methodCanBeCalled = function( evth, method ){
        var name = method.name;

        describe(name, function() {
            var callback = sinon.spy();

            it( 'calls Evrythng.request', function() {
                evth[name]('article', callback);

                this.requests[0].respond(200, { 'Content-Type': 'application/json' },
                                        '[{ "id": 12, "comment": "Hey there" }]');

                expect( evth.request.called ).toBeTruthy();
                expect( this.requests.length ).toBe( 1 );
            });

            it('and its callback is called', function() {
                expect(callback.called).toBeTruthy();
            });
        });
    };

    describe('Inner methods',function() {
        beforeEach(function () {
            xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            xhr.onCreate = function (req) { requests.push(req); };
            sinon.spy( evth, 'request' );
        });

        for ( var m in methods ){
            if ( methods.hasOwnProperty( m ) ){
                methodCanBeCalled( evth, methods[m] );
            }
        }

        afterEach( function() {
            xhr.restore();
            evth.request.restore();
        });
    });

    describe('the buildUrl method',function() {
        it('builds a URL properly', function() {
            var url = evth.buildUrl('aaa/%s','bbbb');
            expect( url ).toBe('aaa/bbbb');
        });
        it('builds a URL properly', function() {
            var url = evth.buildUrl('aaa/%s/bbbb/%s','cccc','dddd');
            expect( url ).toBe('aaa/cccc/bbbb/dddd');
        });
    });

});

