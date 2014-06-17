define([
  'core',
  './entity',
  'resource',
  'utils'
], function (EVT, Entity, Resource, Utils) {
  'use strict';

  // Setup Property inheritance from Entity.
  var Property = function () {
    Entity.apply(this, arguments);
  };

  Property.prototype = Object.create(Entity.prototype);
  Property.prototype.constructor = Property;


  // The property update normalization of arguments allows to
  // make easier and more intuitive calls, such as:

  // - Single property update:

  // ```
  //  thng.property('status').update('off');
  //  thng.property('status').update({
  //    value: 'off'
  //  });
  // ```

  // - Multi property update:

  // ```
  //  thng.property().update({
  //    status: 'off',
  //    level: '80'
  //  });
  // ```
  function _normalizeArguments(args) {
    var data = args[0];

    if(Utils.isString(data)){

      // Update single property using string.
      args[0] = [{
        value: data
      }];

    }else if(Utils.isObject(data)) {

      if (data.value) {

        // Update single property using object notation.
        args[0] = [data];

      } else {

        // Update multiple properties, creating an object for
        // each key-value pair.
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


  // Attach class to EVT module.
  EVT.Property = Property;


  return {

    resourceConstructor: function (property) {

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

      // Override property resource update to allow custom values params.
      // See *_normalizeArguments()*.
      resource.update = function () {
        return Resource.prototype.update.apply(this, _normalizeArguments(arguments));
      };

      return resource;
    }

  };
});