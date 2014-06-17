define([
  'core',
  './entity',
  'resource',
  './property',
  'utils'
], function (EVT, Entity, Resource, Property, Utils) {
  'use strict';

  // Evrythngs Collection definition
  var Collection = function () {

    // Setup base Scope
    Entity.apply(this, arguments);

  };

  // Setup inheritance
  Collection.prototype = Object.create(Entity.prototype);
  Collection.prototype.constructor = Collection;

  function collectionThng(id) {
    if(!this.resource) {
      throw new Error('This Entity does not have a Resource.');
    }

    var path = this.resource.path + '/thngs';

    if(id){
      if(Utils.isString(id)) {
        path += '/' + id;
      } else {
        throw new TypeError('ID must be a string');
      }
    }

    return new Resource(this.resource.scope, path, EVT.Thng);
  }

  /**
   * Extend Entity API for Product
   */
  Utils.extend(Collection.prototype, {

    // Create a Thng resource for this collection
    thng: collectionThng

  }, true);

  // Attach class
  EVT.Collection = Collection;

  return {
    resourceConstructor: Entity.resourceConstructor('/collections', EVT.Collection)
  };
});