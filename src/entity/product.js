define([
  'core',
  './entity',
  'resource',
  './property',
  'utils'
], function (EVT, Entity, Resource, Property, Utils) {
  'use strict';

  // Evrythngs Product definition
  var Product = function () {

    // Setup base Scope
    Entity.apply(this, arguments);

  };

  // Setup inheritance
  Product.prototype = Object.create(Entity.prototype);
  Product.prototype.constructor = Product;


  /**
   * Extend Entity API for Product
   */
  Utils.extend(Product.prototype, {

    // Create a Property resource for this product
    property: Property.resourceConstructor

  }, true);


  // Attach class
  EVT.Product = Product;

  return {
    resourceConstructor: Entity.resourceConstructor('/products', EVT.Product)
  };
});