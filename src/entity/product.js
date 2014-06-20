// ## PRODUCT.JS

// **The Product is a simple Entity subclass that provides a nested
// Property Resource.**

define([
  'core',
  './entity',
  'resource',
  './property',
  './action',
  'utils'
], function (EVT, Entity, Resource, Property, Action, Utils) {
  'use strict';

  // Setup Product inheritance from Entity.
  var Product = function () {
    Entity.apply(this, arguments);
  };

  Product.prototype = Object.create(Entity.prototype);
  Product.prototype.constructor = Product;


  // Extend Product API by exposing a Property Resource, allowing to
  // manage the properties of this product with a resource pattern.
  // Expose an Action resource as well, for managing Products actions.
  Utils.extend(Product.prototype, {

    property: Property.resourceConstructor,

    action: Action.resourceConstructor
  
  }, true);


  // Attach class to EVT module.
  EVT.Product = Product;


  return {
    resourceConstructor: Resource.constructorFactory('/products', EVT.Product)
  };
});