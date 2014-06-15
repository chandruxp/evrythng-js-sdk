define([
  'core',
  './entity',
  'resource',
  'utils'
], function (EVT, Entity, Resource, Utils) {
  'use strict';

  var Property = function () {

    // Setup base Scope
    Entity.apply(this, arguments);
  };

  // Setup inheritance
  Property.prototype = Object.create(Entity.prototype);
  Property.prototype.constructor = Property;

  function _normalizeArguments(args) {
    var data = args[0];

    if(Utils.isString(data)){
      args[0] = [{
        value: data
      }];
    }else if(Utils.isObject(data)) {
      // update single property using obj notation
      if (data.value) {
        args[0] = [data];

        // update multiple properties
      } else {
        args[0] = [];
        for (var key in data) {
          args[0].push({
            key: key,
            value: data[key]
          });
        }
      }
    }

    return args;
  }


  // Return resource constructor
  function resourceConstructor(property) {
    if(!this.resource) {
      throw new Error('This Entity does not have a Resource.');
    }

    var path = this.resource.path + '/properties',
      resource;

    if(property){
      if(Utils.isString(property)){
        path += '/' + property;
      }else{
        throw new TypeError('Property must be a key/name string');
      }
    }

    resource = new Resource(this.resource.scope, path, EVT.Property);

    // Override property resource update to allow a single string value
    resource.update = function () {
      return Resource.prototype.update.apply(this, _normalizeArguments(arguments));
    };

    return resource;
  }

// Attach class
  EVT.Property = Property;

  return {
    resourceConstructor: resourceConstructor
  };
});