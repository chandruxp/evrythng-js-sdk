define([
  'core',
  './entity',
  'resource',
  'utils'
], function (EVT, Entity, Resource, Utils) {
  'use strict';

  var Action = function () {

    // Setup base Scope
    Entity.apply(this, arguments);
  };

  // Setup inheritance
  Action.prototype = Object.create(Entity.prototype);
  Action.prototype.constructor = Action;

  // Generate object if first argument is empty
  function _normalizeArguments(obj) {
    var args = arguments;

    if(!obj || Utils.isFunction(obj)) {
      var pathSplit = this.path.split('/');

      // Make real array from arguments
      args = Array.prototype.slice.call(arguments, 0);
      args.unshift({
        type: pathSplit[pathSplit.length-1]
      });
    }

    return args;
  }


  // Attach class
  EVT.Action = Action;

  return {
    resourceConstructor: function (actionType, id) {
      var path, resource;

      if(actionType){
        if(Utils.isString(actionType)){
          path = '/actions/' + actionType;
        }else{
          throw new TypeError('Action type must be a name string');
        }
      }else{
        throw new TypeError('Action type cannot be empty.');
      }

      resource = Entity.resourceConstructor(path, EVT.Action).call(this, id);

      // Override action resource create to allow empty method
      resource.create = function () {
        var args = _normalizeArguments.apply(this, arguments);
        return Resource.prototype.create.apply(this, args);
      };

      return resource;
    }
  };
});