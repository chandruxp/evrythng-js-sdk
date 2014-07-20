// ## MULTIMEDIA.JS

// **The Multimedia is a simple Entity subclass representing the REST API
// Multimedia Content object.**

define([
  'core',
  './entity',
  'resource'
], function (EVT, Entity, Resource) {
  'use strict';

  // Setup Multimedia inheritance from Entity.
  var Multimedia = function () {
    Entity.apply(this, arguments);
  };

  Multimedia.prototype = Object.create(Entity.prototype);
  Multimedia.prototype.constructor = Multimedia;


  // Attach class to EVT module.
  EVT.Multimedia = Multimedia;


  return {
    resourceConstructor: Resource.constructorFactory('/contents/multimedia', EVT.Multimedia)
  };
});