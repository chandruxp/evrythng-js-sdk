define([
  'core',
  'resource',
  'scope/application',
  'entity/product'
], function (EVT, Resource) {
  'use strict';

  describe('EVT Resource', function () {
    var app,
      path = '/products',
      fullPath = EVT.settings.apiUrl + path,
      request,
      successCb,
      errorCb;

    beforeEach(function () {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/aplications/me')
        .andReturn(TestResponses.application.simple);

      app = new EVT.App('xxx');
      successCb = jasmine.createSpy('success');
      errorCb = jasmine.createSpy('error');
    });

    afterEach(function () {
      jasmine.Ajax.uninstall();
    });

    describe('Constructor', function () {

      it('should need a Scope', function () {
        var badConstructor = function () {
          new Resource();
        };

        expect(badConstructor).toThrow();
      });

      it('should need a Scope of type Scope', function () {
        var badConstructor = function () {
          new Resource(function () {});
        };

        expect(badConstructor).toThrow();
      });

      describe('with Scope', function () {

        it('should need a path', function () {
          var badConstructor = function () {
            new Resource(app);
          };

          expect(badConstructor).toThrow();
        });

        describe('without Class', function () {

          beforeEach(function () {
            console.info = jasmine.createSpy('info');
          });

          it('should log info message', function () {
            new Resource(app, path);

            expect(console.info).toHaveBeenCalled();
          });

          it('should store scope and path', function () {
            var resource = new Resource(app, path);

            expect(resource.scope.apiKey).toEqual('xxx');
            expect(resource.path).toEqual(path);
          });

          it('should allow path without leading /', function () {
            var resource = new Resource(app, 'products');

            expect(resource.path).toEqual(path);
          });

        });

        describe('with Class', function () {

          it('should log error if does not have toJSON() method', function () {
            console.error = jasmine.createSpy('error');

            new Resource(app, path, function () {});
            expect(console.error).toHaveBeenCalled();
          });

          it('should store class', function () {
            var resource = new Resource(app, path, EVT.Product);

            expect(resource.class).toEqual(EVT.Product);
          });

        });

      });

    });

    describe('API', function () {
      var productResource;

      beforeEach(function () {
        productResource = new Resource(app, path);
      });

      describe('.parse()', function () {

        it('should return undefined on empty', function () {
          expect(productResource.parse()).not.toBeDefined();
        });

        it('should return input if theres no Class', function () {
          var obj = {test:'a'};
          expect(productResource.parse(obj)).toEqual(obj);
        });

        describe('with Class', function () {

          beforeEach(function () {
            productResource = new Resource(app, path, EVT.Product);
          });

          it('should return instance of Class', function () {
            var obj = {test:'a'};
            var prod = productResource.parse(obj);

            expect(prod instanceof EVT.Product).toBeTruthy();
          });

          it('should return array of instances if input is array', function () {
            var objArray = [
              {test:'a'},
              {test:'b'}
            ];

            var prodList = productResource.parse(objArray);
            expect(prodList.length).toBe(2);
            for(var i in prodList) {
              expect(prodList[i] instanceof EVT.Product).toBeTruthy();
            }
          });

        });

      });

      describe('.read()', function () {

        it('should return a promise', function () {
          expect(productResource.read().then).toBeDefined();
        });

        it('should allow params', function () {
          productResource.read({
            params: {
              page: 2
            }
          });

          expect(jasmine.Ajax.requests.mostRecent().url).toBe(fullPath + '?page=2');
        });

        it('should allow synchronous requests', function () {
          jasmine.Ajax.stubRequest(fullPath).andReturn(TestResponses.products.all);

          var products = productResource.read({
            async: false
          });

          expect(products.length).toBe(2);
        });

        it('should allow full responses', function (done) {
          productResource.read({
            fullResponse: true
          }).then(function (response) {
            expect(response.data.length).toBe(2);
            expect(response.headers).toBeDefined();
            expect(response.status).toBeDefined();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.all);
        });

        it('should send GET request to path using scopes api key', function () {
          productResource.read();

          request = jasmine.Ajax.requests.mostRecent();
          expect(request.method).toBe('get');
          expect(request.url).toBe(fullPath);
          expect(request.requestHeaders.Authorization).toBe(app.apiKey);
        });

        it('should provide error handler', function (done) {
          productResource.read().then(function () {
            expect(false).toBeTruthy();
            done();
          }, function (err) {
            expect(err.message).toBeDefined();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.accessDenied);
        });

        it('should allow callbacks', function (done) {
          productResource.read(successCb).then(function () {
            expect(successCb).toHaveBeenCalled();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.all);
        });

        it('should allow options and callbacks', function (done) {
          productResource.read({
            fullResponse: true,
            params: {
              page: 2
            }
          }, null, errorCb).then(function () {
            expect(false).toBeTruthy();
            done();
          }, function () {
            expect(errorCb).toHaveBeenCalled();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.accessDenied);
        });

        it('should allow callbacks in options object', function (done) {
          productResource.read({
            fullResponse: true,
            params: {
              page: 2
            },
            success: successCb,
            error: errorCb
          }).then(function () {
            expect(successCb).toHaveBeenCalled();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.all);
        });

        describe('with Class', function () {

          beforeEach(function () {
            productResource = new Resource(app, path, EVT.Product);
          });

          it('should return array of instances of class on success', function (done) {
            productResource.read().then(function (products) {
              expect(products.length).toBe(2);
              for(var i in products) {
                expect(products[i] instanceof EVT.Product).toBeTruthy();
              }
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.products.all);
          });

          it('should return instance of class on success', function (done) {
            productResource.read().then(function (product) {
              expect(product instanceof EVT.Product).toBeTruthy();
              expect(product.name).toBe('qwer');
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
          });

        });

      });

      describe('.create()', function () {

        it('should need some payload', function () {
          var badCall = function () {
            productResource.create();
          };

          expect(badCall).toThrow();
        });

        it('should return a promise', function () {
          expect(productResource.create({}).then).toBeDefined();
        });

        it('should send POST request, api Key and payload', function () {
          productResource.create({
            test: 'a'
          });

          request = jasmine.Ajax.requests.mostRecent();

          expect(request.params).toBe('{"test":"a"}');
          expect(request.method).toBe('post');
          expect(request.url).toBe(fullPath);
          expect(request.requestHeaders.Authorization).toBe(app.apiKey);
        });

        it('should allow options', function () {
          jasmine.Ajax.stubRequest(fullPath + '?page=2').andReturn(TestResponses.products.one);

          var newProduct = productResource.create({},{
            params: {
              page: 2
            },
            fullResponse: true,
            async: false
          });

          expect(jasmine.Ajax.requests.mostRecent().url).toBe(fullPath + '?page=2');
          expect(newProduct.data.name).toBe('qwer');
          expect(newProduct.status).toBe(200);
        });

        it('should handle response with crated object', function (done) {
          productResource.create(JSON.parse(TestResponses.products.one.responseText))
            .then(function (product) {
              expect(product.name).toBe('qwer');
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
        });

        it('should provide error handler', function (done) {
          productResource.create({}).then(function () {
            expect(false).toBeTruthy();
            done();
          }, function (err) {
            expect(err.errors[0]).toBe('Access was denied!');
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.accessDenied);
        });

        it('should allow callbacks', function (done) {
          productResource.create({}, successCb).then(function () {
            expect(successCb).toHaveBeenCalled();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
        });

        it('should not allow callback as first parameter', function () {
          var badCall = function () {
            productResource.create(successCb);
          };

          expect(badCall).toThrow();
          expect(successCb).not.toHaveBeenCalled();
        });

        it('should allow options and callbacks', function (done) {
          productResource.create({}, {
            params: {
              page: 2
            }
          }, successCb, errorCb).then(function () {
            expect(false).toBeTruthy();
            done();
          }, function () {
            expect(errorCb).toHaveBeenCalled();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.accessDenied);
        });

        it('should allow callbacks in options object', function (done) {
          productResource.create({}, {
            params: {
              page: 2
            },
            success: successCb,
            error: errorCb
          }).then(function () {
            expect(successCb).toHaveBeenCalled();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
        });

        describe('with Class', function () {

          beforeEach(function () {
            productResource = new Resource(app, path, EVT.Product);
          });

          it('should return instace of class on success', function (done) {
            productResource.create(JSON.parse(TestResponses.products.one.responseText))
              .then(function (product) {
                expect(product instanceof EVT.Product).toBeTruthy();
                expect(product.name).toBe('qwer');
                expect(product.toJSON).toBeDefined();
                done();
              }, function () {
                expect(false).toBeTruthy();
                done();
              });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
          });

          it('should allow to pass data as Class instance', function (done) {
            var product = new EVT.Product(JSON.parse(TestResponses.products.one.responseText));

            productResource.create(product)
              .then(function (prod) {
                expect(prod instanceof EVT.Product).toBeTruthy();
                expect(prod.name).toBe('qwer');
                done();
              }, function () {
                expect(false).toBeTruthy();
                done();
              });

            request = jasmine.Ajax.requests.mostRecent();

            expect(request.params).toBe('{"id":"1","name":"qwer"}');
            jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
          });

        });

      });

      describe('.update()', function () {

        it('should need some payload', function () {
          var badCall = function () {
            productResource.create();
          };

          expect(badCall).toThrow();
        });

        it('should send PUT request, api Key and payload', function () {
          productResource.update({
            test: 'a'
          });

          request = jasmine.Ajax.requests.mostRecent();

          expect(request.params).toBe('{"test":"a"}');
          expect(request.method).toBe('put');
          expect(request.url).toBe(fullPath);
          expect(request.requestHeaders.Authorization).toBe(app.apiKey);
        });

        it('should return bare response', function (done) {
          productResource.update(JSON.parse(TestResponses.products.one.responseText))
            .then(function (prod) {
              expect(prod.name).toBe('qwer');
              done();
            }, function () {
              expect(false).toBeTruthy();
            });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
        });

        describe('with Class', function () {

          beforeEach(function () {
            productResource = new Resource(app, path, EVT.Product);
          });

          it('should return instace of class on success', function (done) {
            productResource.update(JSON.parse(TestResponses.products.one.responseText))
              .then(function (product) {
                expect(product instanceof EVT.Product).toBeTruthy();
                expect(product.name).toBe('qwer');
                expect(product.toJSON).toBeDefined();
                done();
              }, function () {
                expect(false).toBeTruthy();
                done();
              });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
          });

          it('should allow to pass data as Class instance', function (done) {
            var product = new EVT.Product(JSON.parse(TestResponses.products.one.responseText));

            productResource.update(product)
              .then(function (prod) {
                expect(prod instanceof EVT.Product).toBeTruthy();
                expect(prod.name).toBe('qwer');
                done();
              }, function () {
                expect(false).toBeTruthy();
                done();
              });

            request = jasmine.Ajax.requests.mostRecent();

            expect(request.params).toBe('{"id":"1","name":"qwer"}');
            jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
          });

        });

      });

      describe('.delete()', function () {

        it('should send DELETE request with scopes api Key', function () {
          productResource.delete();

          request = jasmine.Ajax.requests.mostRecent();

          expect(request.method).toBe('delete');
          expect(request.url).toBe(fullPath);
          expect(request.requestHeaders.Authorization).toBe(app.apiKey);
        });

        it('should handle 200 OK responses', function (done) {
          productResource.delete()
            .then(function (response) {
              expect(response).toBeNull();
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.ok);
        });

        it('should get full response without data', function (done) {
          productResource.delete({
            fullResponse: true
          }).then(function (response) {
            expect(response.status).toBe(200);
            expect(response.data).toBeNull();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.ok);
        });

      });

    });

  });
});