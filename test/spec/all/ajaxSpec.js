define([
  'ajax',
  'ajax/cors',
  'ajax/jsonp'
], function (EVT, corsRequest, jsonpRequest) {
  'use strict';

  describe('EVT Ajax', function () {
    var apiUrl = 'http://api.evrythng.com',
      crudVerbs = {
        create: 'post',
        read: 'get',
        update: 'put',
        delete: 'delete'
      };

    beforeEach(function() {
      // setup EVT to make calls to the defined API Url
      EVT.setup({
        apiUrl: apiUrl,
        async: true
      });

      jasmine.Ajax.install();
    });

    afterEach(function() {
      EVT.setup({
        apiUrl: 'https://api.evrythng.com',
        async: true,
        fullResponse: false,
        fetchCascade: false,
        onStartRequest: null,
        onFinishRequest: null,
        geolocation: true
      });

      jasmine.Ajax.uninstall();
    });

    describe('CORS', function () {

      it('should be async by default and return a Promise', function () {
        var promise = corsRequest();

        expect(promise.then).toBeDefined();
      });

      it('should use requests defaults', function () {
        corsRequest();

        expect(jasmine.Ajax.requests.mostRecent().url).toBe('');
        expect(jasmine.Ajax.requests.mostRecent().method).toBe(crudVerbs.read);
      });

      it('should allow all CRUD verbs', function () {
        for(var verb in crudVerbs){
          corsRequest({ method: crudVerbs[verb]});

          expect(jasmine.Ajax.requests.mostRecent().method).toBe(crudVerbs[verb]);
        }
      });

      it('should append endpoint to base API Url', function () {
        corsRequest({ url: '/thngs'});

        expect(jasmine.Ajax.requests.mostRecent().url).toBe('/thngs');
      });

      it('should build params and append to Url', function () {
        corsRequest({
          params: {
            perPage: 20
          }
        });

        expect(jasmine.Ajax.requests.mostRecent().url).toBe('?perPage=20');
      });

      it('should build multiple params and append to Url', function () {
        corsRequest({
          params: {
            page: 1,
            perPage: 20
          }
        });

        expect(jasmine.Ajax.requests.mostRecent().url).toBe('?page=1&perPage=20');
      });

      it('should build and append multiple params, even if url already has some', function () {
        corsRequest({
          url: '/thngs?app=123&q=abc',
          params: {
            page: 1,
            perPage: 20
          }
        });

        expect(jasmine.Ajax.requests.mostRecent().url).toBe('/thngs?app=123&q=abc&page=1&perPage=20');
      });

      it('should send JSON data as string', function () {
        corsRequest({
          url: '/thngs',
          method: 'post',
          data: {
            name: 'AAA',
            description: 'bbb'
          }
        });

        expect(jasmine.Ajax.requests.mostRecent().params).toBe('{"name":"AAA","description":"bbb"}');
      });

      it('should send authorization header', function () {
        corsRequest({
          url: '/thngs',
          authorization: 'abc'
        });

        expect(jasmine.Ajax.requests.mostRecent().requestHeaders.Authorization).toBe('abc');
      });

      describe('Handlers', function () {
        var promise, request;

        beforeEach(function () {
          promise = corsRequest({ url: '/thngs' });
          request = jasmine.Ajax.requests.mostRecent();
        });

        it('should handle 200 response with JSON data', function (done) {
          promise.then(function (thngs) {
            expect(thngs.length).toBe(2);
            done();
          },function(){
            expect(false).toBeTruthy();
            done();
          });

          request.response(TestResponses.thngs.all);
        });

        it('should handle 200 response without data', function (done) {
          promise.then(function (response) {
            expect(response).toBeNull();
            done();
          },function(){
            expect(false).toBeTruthy();
            done();
          });

          request.response(TestResponses.ok);
        });

        it('should log and handle errors', function (done) {
          console.error = jasmine.createSpy('error');

          promise.then(function () {
            expect(false).toBeTruthy();
            done();
          }, function (error) {
            expect(console.error).toHaveBeenCalled();
            expect(error.status).toBe(403);
            expect(error.url).toBe('/thngs');
            expect(error.errors).toBeDefined();
            done();
          });

          request.response(TestResponses.accessDenied);
        });

        it('should handle full response', function (done) {
          corsRequest({
            url: '/thngs',
            fullResponse: true
          }).then(function (response) {
            expect(response.data.length).toBe(2);
            expect(response.headers['X-Result-Count']).toEqual('2');
            expect(response.status).toBe(200);
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.all);
        });
      });

      describe('with Callbacks', function () {
        var promise, request;
        var successCb, errorCb;

        beforeEach(function () {
          successCb = jasmine.createSpy("success");
          errorCb = jasmine.createSpy("error");

          promise = corsRequest({ url: '/thngs' }, successCb, errorCb);
          request = jasmine.Ajax.requests.mostRecent();
        });

        it('on Success should be called on successful response', function () {
          request.response(TestResponses.thngs.all);

          expect(successCb).toHaveBeenCalled();

          var successArgs = successCb.calls.mostRecent().args[0];

          expect(successArgs.length).toEqual(2);
          expect(successArgs[0].id).toEqual('123');
        });

        it('on Error should be called on failed response', function () {
          request.response(TestResponses.accessDenied);

          expect(errorCb).toHaveBeenCalled();

          var errorArgs = errorCb.calls.mostRecent().args[0];
          expect(errorArgs.message).toBeDefined();
        });

        it('should still resolve promise', function (done) {
          promise.then(function (thngs) {
            expect(thngs.length).toBe(2);
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          request.response(TestResponses.thngs.all);
        });
      });

      describe('with Synchronous Requests', function () {

        it('should return successful response immediately', function () {
          jasmine.Ajax.stubRequest('/thngs').andReturn(TestResponses.thngs.all);

          var thngs = corsRequest({
            url: '/thngs',
            async: false
          });

          expect(thngs.length).toBe(2);
        });

        it('should throw error if failed', function () {
          jasmine.Ajax.stubRequest('/thngs').andReturn(TestResponses.accessDenied);

          var badRequest = function () {
            corsRequest({
              url: '/thngs',
              async: false
            });
          };

          expect(badRequest).toThrow();
        });
      });

    });

    describe('JSONP', function () {

      it('should be async by default and return a Promise', function () {
        inspectJsonpRequest(function (script) {
          expect(script.async).toBe(true);
        });

        var promise = jsonpRequest();

        expect(promise.then).toBeDefined();
      });

      it('should use Jsonp apiUrl', function () {
        inspectJsonpRequest(function (script) {
          expect(script.src).toContain('js-api');
        });

        jsonpRequest({
          url: 'https://api.evrythng.com/thngs'
        });
      });

      it('should include authorization header in access_token param', function () {
        inspectJsonpRequest(function (script) {
          expect(script.src).toContain('access_token=apikey');
        });

        jsonpRequest({
          url: 'https://api.evrythng.com/thngs',
          authorization: 'apikey'
        });
      });

      it('should allow success callback and promise', function (done) {
        var successCb = jasmine.createSpy('success');

        respondToJsonpRequest(TestResponses.jsonp.thngs.all);

        jsonpRequest({
          url: 'https://api.evrythng.com/thngs'
        }, successCb).then(function (response) {
          expect(successCb).toHaveBeenCalled();
          expect(response.length).toBe(2);
          done();
        });
      });

      it('should allow error callback with error object', function (done) {
        var errorCb = jasmine.createSpy('error');
        console.error = jasmine.createSpy('console.error');

        respondToJsonpRequest(TestResponses.jsonp.accessDenied);

        jsonpRequest({
          url: 'https://api.evrythng.com/thngs'
        }, null, errorCb).then(function () {
          expect(false).toBeTruthy();
          done();
        }, function (err) {
          expect(errorCb).toHaveBeenCalled();
          expect(err.errors).toBeDefined();
          expect(err.method).toBeDefined();
          expect(err.status).toBe('403');
          expect(console.error).toHaveBeenCalled();
          done();
        });
      });

      it('should allow synchronous requests', function () {
        inspectJsonpRequest(function (script) {
          expect(script.async).toBe(false);
        });

        jsonpRequest({
          url: 'https://api.evrythng.com/thngs',
          async: false
        });
      });

    });


    describe('.api()', function () {

      it('should exist', function () {
        expect(EVT.api).toBeDefined();
      });

      it('should allow to specify options for each request', function () {
        jasmine.Ajax.stubRequest(apiUrl + '/thngs').andReturn(TestResponses.thngs.all);

        var thngs = EVT.api({
          url: '/thngs',
          method: 'post',
          data: {
            name: 'abc'
          },
          async: false
        });

        expect(jasmine.Ajax.requests.mostRecent().url).toBe(apiUrl + '/thngs');
        expect(jasmine.Ajax.requests.mostRecent().method).toBe('post');
        expect(jasmine.Ajax.requests.mostRecent().params).toBe('{"name":"abc"}');

        expect(thngs).not.toBeNull();
      });

      it('should allow callbacks and promises', function (done) {
        var successCb = jasmine.createSpy('success');

        EVT.api({ url: '/thngs' }, successCb, function () {
          expect(false).toBeTruthy();
        }).then(function () {
          expect(successCb).toHaveBeenCalled();
          done();
        }, function () {
          expect(false).toBeTruthy();
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.all);
      });

      it('should allow callbacks in options object', function (done) {
        var successCb = jasmine.createSpy('success');

        EVT.api({
          url: '/thngs',
          success: successCb
        }).then(function () {
          expect(successCb).toHaveBeenCalled();
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.all);
      });

      it('should give priority to last defined callbacks', function (done) {
        var successCb1 = jasmine.createSpy('success');
        var successCb2 = jasmine.createSpy('success2');

        EVT.api({
          url: '/thngs',
          success: successCb1
        }, successCb2).then(function () {
          expect(successCb1).not.toHaveBeenCalled();
          expect(successCb2).toHaveBeenCalled();
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.all);
      });

      it('should allow API calls with fullResponse', function (done) {
        EVT.api({
          url: '/thngs',
          fullResponse: true
        }).then(function (response) {
          expect(response.data).toBeDefined();
          expect(response.headers).toBeDefined();
          expect(response.status).toBeDefined();
          done();
        }, function () {
          expect(false).toBeTruthy();
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.all);
      });

      it('should re-throw exception on Synchronous call failure', function () {
        jasmine.Ajax.stubRequest(apiUrl + '/thngs').andReturn(TestResponses.accessDenied);

        var badRequest = function () {
          EVT.api({
            url: '/thngs',
            async: false
          });
        };

        expect(badRequest).toThrow(new Error('CORS Request failed. View log for more info.'));
      });
    });
  });
});