// ## APPUSER.JS

// **The App User entity represents the app users stored in the Engine.
// It inherits from Entity and adds a new resource's *validate()* method,
// as well as a *self.validate()* to allow to validate users.**

define([
  'core',
  './entity',
  'resource',
  'utils',
  'ajax'
], function (EVT, Entity, Resource, Utils) {
  'use strict';

  // Setup AppUser inheritance from Entity.
  var AppUser = function (objData) {

    // Rename user object argument's *evrythngUser* property to
    // entity-standard-*id*.
    if(objData.evrythngUser){
      objData.id = objData.evrythngUser;
      delete objData.evrythngUser;
    }

    Entity.apply(this, arguments);
  };

  AppUser.prototype = Object.create(Entity.prototype);
  AppUser.prototype.constructor = AppUser;

  // The validate method sends a `POST` request to the validate
  // endpoint of a new user. This is only valid when the AppUser
  // resource path is *'/auth/evrythng/users/1'*.
  function validate(activationCode) {

    if(!activationCode || !Utils.isString(activationCode)) {
      throw new Error('Activation code must be a string.');
    }

    var scope = this.scope, path = this.path;

    // If validate is called from the entity, the scope is the
    // resource's scope
    if(this.id){
      scope = this.resource.scope;
      path = this.resource.path + '/' + this.id;
    }

    // Activate newly created user.
    return EVT.api({
      url: path + '/validate',
      method: 'post',
      authorization: scope.apiKey,
      data: {
        activationCode: activationCode
      }
    });
  }


  // Extend AppUser API to allow to validate itself.
  Utils.extend(AppUser.prototype, {

    validate: function () {
      return validate.call(this, this.activationCode);
    }

  }, true);


  // Attach class to EVT module.
  EVT.AppUser = AppUser;


  // The AppUser resource constructor is a custom constructor that
  // returns the constructor. This allows the path to be variable.

  // *In practice '/users' and '/auth/evrythng/users' return the same
  // entity structure.*
  return {

    resourceConstructor: function (customPath) {

      var path = customPath || '/users';

      // Return the factory function.
      return function (id) {

        var resource = Resource.constructorFactory(path, EVT.AppUser).call(this, id);

        // Add *validate()* method to the resource as well
        resource.validate = function () {
          return validate.apply(this, arguments);
        };

        return resource;
      };
    }

  };
});