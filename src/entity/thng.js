// ## THNG.JS

// **The Thng is a simple Entity subclass that provides a nested
// Property Resource and a direct method to read the Thng's Product.**

define([
  'core',
  './entity',
  'resource',
  './property',
  './action',
  'utils',
  'ajax'
], function (EVT, Entity, Resource, Property, Action, Utils) {
  'use strict';

  // Setup Thng inheritance from Entity.
  var Thng = function () {
    Entity.apply(this, arguments);
  };

  Thng.prototype = Object.create(Entity.prototype);
  Thng.prototype.constructor = Thng;


  // When not using `fetchCascade`, this method allows to easily
  // fetch the Product entity of this Thng. It fowards the call
  // to this thng's scope's product resource.
  function readProduct() {

    if(!this.product) {
      throw new Error('Thng does not have a product.');
    }

    if(!this.resource) {
      throw new Error('Thng does not have a resource.');
    }

    return this.resource.scope.product(this.product).read();
  }


  // Extend Thng API by exposing a Property Resource, allowing to
  // manage the properties of this product with a resource pattern.
  // Expose an Action resource as well, for managing Thngs actions.
  // Also attach the *readProduct()* method to every Thng.
  Utils.extend(Thng.prototype, {

    property: Property.resourceConstructor,

    action: Action.resourceConstructor,

    readProduct: readProduct

  }, true);


  // Attach class to EVT module.
  EVT.Thng = Thng;


  return {
    resourceConstructor: Resource.constructorFactory('/thngs', EVT.Thng)
  };
});