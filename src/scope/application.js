define([
  'core',
  './scope',
  'resource',
  'entity/product',
  'entity/action',
  'entity/appUser',
  'authentication',
  'social/facebook',
  'utils',
  'logger',
  'ajax'
], function (EVT, Scope, Resource, Product, Action, AppUser, Authentication,
             Facebook, Utils, Logger) {
  'use strict';

  // Application Scope constructor
  // Expect apiKey string
  // Optional options object with { facebook: true } to bind FB App with this app
  var ApplicationScope = function(obj){
    var $this = this;

    // Setup base Scope
    if(Utils.isObject(obj)){
      Scope.call(this, obj.apiKey);
    }else{
      Scope.call(this, obj);
    }

    // Get app information from Engine, using already defined scope.
    // Use new EVT.App('a').$init.then(success) if need to wait
    // for app information.
    this.$init = EVT.api({
      url: '/applications',
      authorization: this.apiKey
    }).then(function (apps) {

      // Store app information in scope
      delete apps[0].appApiKey;
      return Utils.extend($this, apps[0], true);

    }, function () {
      Logger.error('There is no application with this API Key.');

    }).then(function (app) {

      // If using Facebook, return new promise after FB is initialized
      // and user login status is retrieved
      if(obj.facebook){
        return Facebook.init(app.socialNetworks.facebook.appId)
          .then(function (response) {

            if(response.status === 'connected') {
              return Authentication.authFb.call($this, response);
            } else {
              return response;
            }

          }).then(function (response) {
            return Utils.extend(response, { app: app });
          });
      }else{
        return app;
      }

    });
  };

  // Setup inheritance
  ApplicationScope.prototype = Object.create(Scope.prototype);
  ApplicationScope.prototype.constructor = ApplicationScope;


  // Implement Public API
  Utils.extend(ApplicationScope.prototype, {

    product: Product.resourceConstructor,

    action: Action.resourceConstructor,

    appUser: AppUser.resourceConstructor('/auth/evrythng/users'),

    login: Authentication.login

  }, true);


  // Attach class
  EVT.App = ApplicationScope;

  return EVT;
});
