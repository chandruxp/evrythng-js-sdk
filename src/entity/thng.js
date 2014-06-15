define([
  'core',
  './entity',
  'resource',
  './property',
  'utils',
  'ajax'
], function (EVT, Entity, Resource, Property, Utils) {
  'use strict';

  // Evrythngs Thng definition
  var Thng = function () {

    // Setup base Scope
    Entity.apply(this, arguments);

  };

  // Setup inheritance
  Thng.prototype = Object.create(Entity.prototype);
  Thng.prototype.constructor = Thng;


  function readProduct() {
    if(!this.product) {
      throw new Error('Thng does not have a product.');
    }

    if(!this.resource) {
      throw new Error('Thng does not have a resource.');
    }

    return this.resource.scope.product(this.product).read();
  }

  /**
   * Extend Entity API for Product
   */
  Utils.extend(Thng.prototype, {

    // Create a Property resource for this product
    property: Property.resourceConstructor,

    readProduct: readProduct

  }, true);


  // Attach class
  EVT.Thng = Thng;

  return {
    resourceConstructor: function (customPath) {
      var path = customPath || '/thngs';
      return Entity.resourceConstructor(path, EVT.Thng);
    }
  };
});