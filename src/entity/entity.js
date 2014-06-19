// ## ENTITY.JS

// **Entity is a private super class that implements base common methods for
// all Evrythng objects. It establishes the way objects are converted
// to JSON, and provide an *update()* and *delete()* method for all entities.**

define([
  'resource',
  'utils'
], function (Resource, Utils) {
  'use strict';

  // The entity constructor, and therefore all the standard inheritances,
  // accepts:

  // - ***new Entity()**: create an empty entity*
  // - ***new Entity(obj)**: entity with merged obj properties*
  // - ***new Entity(resource)**: empty entity bound to a Resource*
  // - ***new Entity(obj, resource)**: fully build entity bound to a Resource*

  // *Nevertheless, an Entity without Resource cannot request any
  // update or delete. It can however be passed to resources as
  // 'payload' instead of JSON.*

  // ```js
  //  var prod = new EVT.Product({ foo: 'bar' };
  //  // prod.update() // throws error
  //  app.product().create(prod); // create product
  // ```

  var Entity = function (objData, resource) {

    if(Utils.isObject(objData)){

      if(objData instanceof Resource){
        this.resource = objData;
      } else {
        this.resource = resource;
        Utils.extend(this, objData, true);
      }

    }
  };

  // Return the JSON object that is stored in engine. All non-function properties
  // except *resource* are properties of the object.
  Entity.prototype.toJSON = function () {
    var json = {};

    for(var prop in this){
      if(this[prop] && !Utils.isFunction(this[prop]) && prop != 'resource'){
        json[prop] = this[prop];
      }
    }

    return json;
  };

  // Every entity can update itself via its resource reference. It does so by
  // passing its JSON representation to the *resouce.update()*.

  // An entity update, as every request, returns a Promise. Although it also
  // allows callbacks as:

  // - ***update()**: simple update itself with modified properties*
  // - ***update(obj)**: update itself with new properties*
  // - ***update(obj, successCb, errorCb)**: previous, with callbacks*
  // - ***update(successCb, errorCb)**: update itself and use callbacks*
  Entity.prototype.update = function (obj) {
    if(this.resource){

      var args = arguments, $this = this;

      // No object is passed, shift arguments. Add its JSON representation
      // as the first argument.
      if(obj === null || !obj || Utils.isFunction(obj)) {
        args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.toJSON());
      }

      return this.resource.update.apply(this.resource, args)
        .then(function (updated) {

          // Update itself with the result and return raw response from API.
          Utils.extend($this, updated, true);
          return updated;

        });

    } else {
      throw new Error('This entity has no resource');
    }
  };


  // Delete method also accepts callbacks as:

  // - ***delete()**: handle with promise*
  // - ***delete(successCb, errorCb)**: handle with callbacks*
  Entity.prototype['delete'] = function () {
    if(this.resource) {
      return this.resource['delete'].apply(this.resource, arguments);
    } else {
      throw new Error('This entity has no resource');
    }
  };


  return Entity;

});