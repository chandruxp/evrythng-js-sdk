define([
  'core',
  './entity',
  'resource',
  'utils',
  'ajax'
], function (EVT, Entity, Resource, Utils) {
  'use strict';

  // Evrythngs User definition
  var AppUser = function (objData) {

    // Rename evrythngUser key to id
    if(objData.evrythngUser){
      objData.id = objData.evrythngUser;
      delete objData.evrythngUser;
    }

    // Setup base Scope
    Entity.apply(this, arguments);

  };

  // Setup inheritance
  AppUser.prototype = Object.create(Entity.prototype);
  AppUser.prototype.constructor = AppUser;

  function validate(activationCode) {
    if(!activationCode || !Utils.isString(activationCode)) {
      throw new Error('Activation code must be a string.');
    }

    return EVT.api({
      url: this.path + '/validate',
      method: 'post',
      authorization: this.scope.apiKey,
      data: {
        activationCode: activationCode
      }
    });
  }

  /**
   * Extend Entity API for Product
   */
  Utils.extend(AppUser.prototype, {

    // Allow user activation as well
    validate: function () {
      return validate.call(this.resource, this.activationCode);
    }

  }, true);


  // Attach class
  EVT.AppUser = AppUser;

  return {
    resourceConstructor: function (customPath) {
      var path = customPath || '/users';

      return function (id) {
        var resource = Entity.resourceConstructor(path, EVT.AppUser).call(this, id);

        // Override property resource update to allow a single string value
        resource.validate = function () {
          return validate.apply(this, arguments);
        };

        return resource;
      };
    }
  };
});