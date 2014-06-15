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

      jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/aplications/me')
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

  });

});