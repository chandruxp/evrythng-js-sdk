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

      jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/applications')
        .andReturn(TestResponses.application.simple);

      app = new EVT.App('xxx');
      productResource = new Resource(app, path, EVT.Product);
      product = new EVT.Property(productResource);
    });

    afterEach(function () {
      jasmine.Ajax.uninstall();
    });

  });

});