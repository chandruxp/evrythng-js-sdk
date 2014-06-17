// ## COLLECTION.JS

// **The Collection is a simple Entity subclass that provides a nested
// Thng Resource.**

define([
  'core',
  './entity',
  'resource',
  'utils'
], function (EVT, Entity, Resource, Utils) {
  'use strict';

  // Setup Collection inheritance from Entity.
  var Collection = function () {
    Entity.apply(this, arguments);
  };

  Collection.prototype = Object.create(Entity.prototype);
  Collection.prototype.constructor = Collection;


  // Custom nested resource constructor for Thngs of a Collection.
  // To create this nested resource, the collection itself needs
  // a resource.
  function collectionThng(id) {
    if(!this.resource) {
      throw new Error('This Entity does not have a Resource.');
    }

    var path = this.resource.path + '/thngs';

    return Resource.constructorFactory(path, EVT.Thng)
      .call(this.resource.scope, id);
  }


  // Extend Collection API by exposing a Thng Resource, allowing to
  // manage Thngs directly from a Collection.
  Utils.extend(Collection.prototype, {
    thng: collectionThng
  }, true);


  // Attach class to EVT module.
  EVT.Collection = Collection;


  return {
    resourceConstructor: Resource.constructorFactory('/collections', EVT.Collection)
  };
});