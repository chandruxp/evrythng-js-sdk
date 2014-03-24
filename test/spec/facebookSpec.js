/*global describe, it, Evrythng, expect, beforeEach, sinon, afterEach, FB*/
describe('Facebook',function() {
    'use strict';
    var evth = new Evrythng({
        evrythngApiKey: 'xxxxxxxxxxxx'
    });

    var xhr;

    describe('fbInit',function() {
        beforeEach(function () {
            xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            xhr.onCreate = function (req) { requests.push(req); };
        });

        it('defines an FB variable', function(done) {
            var callback = sinon.spy();
            evth.fbInit( callback );
            expect( FB ).toBeDefined();
            window.setTimeout( done, 5000 );
        });

        afterEach( function() {
            xhr.restore();
        });
    });
});

