// ## ACTION.JS

// **The Action Entity represents an action in the Engine. It inherits
// from Entity and overload the resource's *create()* method to allow
// empty parameters (no payload).**

define([
  'core',
  './entity',
  'resource',
  'utils',
  'logger'
], function (EVT, Entity, Resource, Utils, Logger) {
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
      args = Array.prototype.slice.call(arguments, 0);
      args.unshift({});
    }

    return args;
  }

  // Set the Entity ID of the entity receiving the action as well
  // as the specified action type in the action data.
  function _fillAction(entity, actionObj, actionType) {

    if(!entity.id){
      throw new Error('This entity does not have an ID.');
    }

    var ret = actionObj;
    ret.type = actionType;

    if(entity.constructor === EVT.Product){
      ret.product = entity.id;
    }else if(entity.constructor === EVT.Thng){
      ret.thng = entity.id;
    }

    return ret;
  }


  // Attach class to EVT module.
  EVT.Action = Action;


  // Return the resource factory function. Actions have a custom *resource
  // constructor* that needs an action type and allows an optional ID.

  // - ***product.action('scans')**: creates path '/actions/scans'*
  // - ***product.action('scans', '1')**: creates path '/actions/scans/1'*
  return {

    resourceConstructor: function (actionType, id) {
      var path, resource, entity = this;

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
      resource = Resource.constructorFactory(path, EVT.Action)
        .call(entity.resource.scope, id);

      // Overload Action resource *create()* method to allow empty object.
      resource.create = function () {

        var $this = this,
          args = _normalizeArguments.apply(this, arguments);

        args[0] = _fillAction(entity, args[0], actionType);

        // If geolocation setting is turned on, get current position before
        // registering the action in the Engine.
        if(EVT.settings.geolocation){

          return Utils.getCurrentPosition().then(function (position) {

            args[0].location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            args[0].locationSource = 'sensor';

            return Resource.prototype.create.apply($this, args);

          }, function (err) {

            // Unable to get position, just inform the reason in the console.
            Logger.info(err);

            return Resource.prototype.create.apply($this, args);

          });

        }else{
          return Resource.prototype.create.apply($this, args);
        }
      };

      return resource;
    }

  };
});