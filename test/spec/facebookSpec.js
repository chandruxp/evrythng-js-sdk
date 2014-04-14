/*global describe, it, Evrythng, expect, beforeEach, sinon, afterEach, jasmine, xit*/

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

var FB = { init: function(){}, getLoginStatus: function(){} };

describe('Facebook',function() {
    'use strict';
    var evth = new Evrythng({
        evrythngApiKey: 'xxxxxxxxxxxx'
    });

    var xhr;
    describe('fbAsyncInit',function() {
        beforeEach( function(){
            sinon.stub( FB, 'init' );
            sinon.stub( FB, 'getLoginStatus' );
            evth.fbAsyncInit();
        });

        it('calls FB.init', function() {
            expect( FB.init.called ).toBeTruthy();
        });

        afterEach( function(){
        });
    });

    describe('fbInit',function() {
        beforeEach(function (done) {
            xhr = sinon.useFakeXMLHttpRequest();
            var requests = this.requests = [];
            var callback = sinon.spy();
            xhr.onCreate = function (req) { requests.push(req); };
            evth.fbInit( callback );
            setTimeout( function(){
                    done();
                }, 10000 );
        });

        xit('defines an FB variable', function(done) {
            expect( window.FB ).toBeDefined();
            done();
        });

        afterEach( function() {
            xhr.restore();
        });
    });
});

