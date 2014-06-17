// ## ACTION.JS

// **The Action Entity represents an action in the Engine. It inherits
// from Entity and overload the resource's *create()* method to allow
// empty parameters (no payload).**

define([
  'core',
  './entity',
  'resource',
  'utils'
], function (EVT, Entity, Resource, Utils) {
  'use strict';

  // Setup Action inheritance from Entity.
  var Action = function () {
    Entity.apply(this, arguments);
  };

  Action.prototype = Object.create(Entity.prototype);
  Action.prototype.constructor = Action;


  // If the action object is empty (or a callback), generate the
  // simplest action object that just needs the type of the action,
  // which can be obtained from the resource's path.
  function _normalizeArguments(obj) {
    var args = arguments;

    if(!obj || Utils.isFunction(obj)) {

      var pathSplit = this.path.split('/'),
        actionType = pathSplit[pathSplit.length-1];

      args = Array.prototype.slice.call(arguments, 0);
      args.unshift({ type: actionType });

    }

    return args;
  }


  // Attach class to EVT module.
  EVT.Action = Action;


  // Return the resource factory function. Actions have a custom *resource
  // constructor* that needs an action type and allows an optional ID.

  // - ***user.action('scans')**: creates path '/actions/scans'*
  // - ***user.action('scans', '1')**: creates path '/actions/scans/1'*
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

      // Create a resource constructor dynamically and call it with this
      // action's ID.
      resource = Resource.constructorFactory(path, EVT.Action).call(this, id);

      // Overload Action resource *create()* method to allow empty object.
      resource.create = function () {
        var args = _normalizeArguments.apply(this, arguments);
        return Resource.prototype.create.apply(this, args);
      };

      return resource;
    }

  };
});