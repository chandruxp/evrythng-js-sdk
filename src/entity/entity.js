define([
  'resource',
  'utils'
], function (Resource, Utils) {
  'use strict';

  // Entity Constructor. Accepts:
  // - Entity()
  // - Entity(obj)
  // - Entity(resource)
  // - Entity(obj, resource)
  var Entity = function (objData, resource) {

    // Allow resource on first parameter without object
    if(Utils.isObject(objData) && objData instanceof Resource){

      this.resource = objData;

    }else{
      // normal constructor
      this.resource = resource;

      if(Utils.isObject(objData)){
        Utils.extend(this, objData, true);

        if(this.resource && objData.id){
          // Add or replace path with ID
          var pathSplit = this.resource.path.split('/');
          if(pathSplit[pathSplit.length-1] !== objData.id) {
            this.resource.path += '/' + objData.id;
          }
        }
      }

    }

  };

  // Return updated JSON object that is stored in engine
  Entity.prototype.toJSON = function () {
    var json = {};

    for(var prop in this){
      if(this[prop] && !Utils.isFunction(this[prop]) && prop != 'resource'){
        json[prop] = this[prop];
      }
    }

    return json;
  };

  Entity.prototype.update = function (obj) {
    if(this.resource){
      var args = arguments,
        $this = this;

      if(obj === null || !obj || Utils.isFunction(obj)) {
        // Make real array from arguments
        args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.toJSON());
      }

      return this.resource.update.apply(this.resource, args)
        .then(function (updated) {
          Utils.extend($this, updated, true);
          return updated;
        });

    } else {
      throw new Error('This entity has no resource');
    }
  };

  Entity.prototype['delete'] = function () {
    if(this.resource) {
      return this.resource['delete'].apply(this.resource, arguments);
    } else {
      throw new Error('This entity has no resource');
    }
  };

  Entity.resourceConstructor = function (path, classFn) {
    return function (id) {
      var fullPath = path || "";

      if(id){
        if(Utils.isString(id)) {
          fullPath += '/' + id;
        } else {
          throw new TypeError('ID must be a string');
        }
      }

      return new Resource(this, fullPath, classFn);
    };
  };

  return Entity;

});