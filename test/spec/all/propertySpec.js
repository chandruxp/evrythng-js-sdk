define([
  'core',
  'entity/entity',
  'entity/product',
  'entity/property',
  'resource',
  'scope/application'
], function (EVT, Product, Property, Resource) {
  'use strict';

  describe('EVT.Property', function () {

    var app, productResource, product,
      path = '/products/123';

    beforeEach(function () {
      jasmine.Ajax.install();

      jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/aplications/me')
        .andReturn(TestResponses.application.simple);

      app = new EVT.App('xxx');
      productResource = new Resource(app, path, EVT.Product);
      product = new EVT.Property(productResource);
    });

    afterEach(function () {
      jasmine.Ajax.uninstall();
    });

    // TODO: normalize API so that /properties/status return single property
/*    it('.update() should allow string', function () {
      product.property('status').read().then(function (property) {
        property.update('off');

        expect(jasmine.Ajax.requests.mostRecent().params).toBe('[{"value":"off"}]');
      });

      jasmine.Ajax.requests.mostRecent().response(TestResponses.properties.one);
    });*/

  });

});