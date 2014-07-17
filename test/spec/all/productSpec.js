define([
  'core',
  'entity/entity',
  'entity/product',
  'entity/property',
  'resource',
  'scope/application'
], function (EVT, Entity, Product, Property, Resource) {
  'use strict';

  describe('EVT.Product', function () {
    var app, productResource, product,
      path = '/products/123';

    beforeEach(function () {
      jasmine.Ajax.install();

      jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/applications')
        .andReturn(TestResponses.application.simple);

      app = new EVT.App('xxx');
      productResource = new Resource(app, path, EVT.Product);
      product = new EVT.Product(productResource);
    });

    afterEach(function () {
      jasmine.Ajax.uninstall();
    });

    it('should inherit from Entity', function () {
      expect(product instanceof Entity).toBeTruthy();
    });

    describe('.property()', function () {
      var propertyResource;

      it('should throw error if Product has no Resource', function () {
        product = new EVT.Product();

        var badConstructor = function () {
          propertyResource = product.property();
        };

        expect(badConstructor).toThrow();
      });

      it('should build properties path using resource path', function () {
        propertyResource = product.property();

        expect(propertyResource.path).toBe('/products/123/properties');
      });

      it('should return Property resource', function () {
        propertyResource = product.property();

        expect(propertyResource instanceof Resource).toBeTruthy();
        expect(propertyResource.class).toEqual(EVT.Property);
      });

      it('should only allow string property ID', function () {
        propertyResource = product.property('status');
        expect(propertyResource.path).toBe('/products/123/properties/status');

        var badConstructor = function () {
          propertyResource = product.property({
            key: 'status'
          });
        };

        expect(badConstructor).toThrow();
      });

      it('ALL should return list of product properties', function (done) {
        productResource = new Resource(app, 'products', EVT.Product);
        product = new EVT.Product(productResource);

        product.property().read().then(function (properties) {
          expect(properties.length).toBe(2);
          expect(properties[0] instanceof EVT.Property).toBeTruthy();
          expect(properties[0].key).toBe('status');
          done();
        }, function () {
          expect(false).toBeTruthy();
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.properties.all);
      });

      it('SINGLE should return history of product property', function (done) {
        product.property('status').read().then(function (history) {
          expect(history.length).toBe(2);
          expect(history[0].value).toBe('on');
          expect(history[1].value).toBe('off');
          done();
        }, function () {
          expect(false).toBeTruthy();
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.properties.one);
      });

      describe('.update()', function () {

        it('should allow single string value', function () {
          product.property('status').update('off');

          expect(jasmine.Ajax.requests.mostRecent().params).toBe('[{"value":"off"}]');
        });

        it('should allow single object', function () {
          product.property('status').update({
            value: "off",
            timestamp: 12345
          });

          expect(jasmine.Ajax.requests.mostRecent().params).toBe('[{"value":"off","timestamp":12345}]');
        });

        it('should allow multiple properties update', function () {
          product.property().update({
            status: 'off',
            level: '70'
          });

          expect(jasmine.Ajax.requests.mostRecent().params).toBe('[{"key":"status","value":"off"},{"key":"level","value":"70"}]');
        });

        it('should still allow callbacks', function () {
          var successCb = jasmine.createSpy('success');

          product.property('status').update('off', successCb);

          jasmine.Ajax.requests.mostRecent().response(TestResponses.properties.one);

          expect(successCb).toHaveBeenCalled();
        });

      });

    });


    describe('.action()', function () {
      var actionResource;

      beforeEach(function () {
        EVT.setup({ geolocation: false });
      });

      afterEach(function () {
        EVT.setup({ geolocation: true });
      });

      it('should throw error if Product has no Resource', function () {
        product = new EVT.Product();

        var badConstructor = function () {
          product.action();
        };

        expect(badConstructor).toThrow();
      });

      it('should need string actionType of type string', function () {
        var badConstructor = function () {
          product.action({});
        };

        expect(badConstructor).toThrow();

        badConstructor = function () {
          product.action(function () {});
        };

        expect(badConstructor).toThrow();
      });

      it('should create Resource for action using EVT.Action class', function () {
        actionResource = product.action('scans');

        expect(actionResource instanceof Resource).toBeTruthy();
        expect(actionResource.path).toBe('/actions/scans');
        expect(actionResource.class).toEqual(EVT.Action);

        expect(actionResource.read).toBeDefined();
      });

      it('should throw error if ID is not string', function () {
        var badConstructor = function () {
          product.action('scans', function () {});
        };

        expect(badConstructor).toThrow();
      });

      describe('.read()', function () {

        it('without ID should handle list of actions', function (done) {
          product.action('scans').read().then(function (scans) {
            expect(scans.length).toBe(2);
            expect(scans[0].customFields.foo).toBe("bar");
            expect(scans[1].user).toBe("000");
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.all);
        });

        it('with ID should handle single object', function (done) {
          product.action('scans', '2134').read()
            .then(function (action) {
              expect(action instanceof EVT.Action).toBeTruthy();
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.one);
        });

      });

      describe('.create()', function () {

        it('should throw Error if product does not have and ID', function () {
          var badCall = function () {
            product.action('scans').create();
          };

          expect(badCall).toThrow();
        });

        it('should wrap empty call', function () {
          product = new EVT.Product({
            id: '1'
          }, productResource);

          product.action('scans').create();

          expect(jasmine.Ajax.requests.mostRecent().data().type).toBe('scans');
        });

        it('should send current product ID', function () {
          product = new EVT.Product({
            id: '1'
          }, productResource);

          product.action('scans').create();

          expect(jasmine.Ajax.requests.mostRecent().data().product).toBe('1');
        });

        it('should merge options', function () {
          product = new EVT.Product({
            id: '1'
          }, productResource);

          product.action('scans').create({
            customFields: {
              foo: 'bar'
            }
          });

          expect(jasmine.Ajax.requests.mostRecent().data().customFields).toEqual({ foo: 'bar' });
        });

        it('should create action', function (done) {
          product = new EVT.Product({
            id: '1'
          }, productResource);

          product.action('scans').create().then(function (action) {
            expect(action).toBeDefined();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.one);
        });

        describe('with Geolocation', function () {
          var geolocation = window.navigator.geolocation;

          beforeEach(function () {
            EVT.setup({
              geolocation: true
            });

            product = new EVT.Product({
              id: '1'
            }, productResource);

            window.navigator.geolocation = function () {};
          });

          afterEach(function () {
            window.navigator.geolocation = geolocation;
          });

          it('should get geolocation from browser', function () {
            window.navigator.geolocation.getCurrentPosition = jasmine.createSpy('getPosition');

            product.action('scans').create();

            expect(window.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
          });

          it('on success should send current location in action', function (done) {
            var position = {
              latitude: 12.2,
              longitude: -0.2
            };

            window.navigator.geolocation.getCurrentPosition = jasmine.createSpy('getPosition')
              .and.callFake(function (successCb) {
                successCb({
                  coords: position
                });
              });

            product.action('scans').create();

            setTimeout(function () {
              expect(jasmine.Ajax.requests.mostRecent().data().location).toEqual(position);
              expect(jasmine.Ajax.requests.mostRecent().data().locationSource).toEqual('sensor');
              done();
            });
          });

          it('on failure should send action without location', function (done) {
            console.info = jasmine.createSpy('info');

            window.navigator.geolocation.getCurrentPosition = jasmine.createSpy('getPosition')
              .and.callFake(function (successCb, errorCb) {
                errorCb({
                  code: 1
                });
              });

            product.action('scans').create();

            setTimeout(function () {
              expect(jasmine.Ajax.requests.mostRecent().data().location).not.toBeDefined();
              expect(jasmine.Ajax.requests.mostRecent().data().locationSource).not.toBeDefined();
              expect(console.info).toHaveBeenCalled();
              done();
            });
          });

          it('if geolocation unavailable send action without location', function () {
            window.navigator.geolocation = geolocation;

            product.action('scans').create();

            expect(jasmine.Ajax.requests.mostRecent().data().location).not.toBeDefined();
            expect(jasmine.Ajax.requests.mostRecent().data().locationSource).not.toBeDefined();
          });

          it('should create action with geolocation', function (done) {
            product.action('scans').create().then(function (action) {
              expect(action).toBeDefined();
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

            setTimeout(function () {
              jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.one);
            });
          });

        });

      });

    });

  });

});