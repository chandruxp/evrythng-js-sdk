// ## APPLICATION.JS

// **Here it is defined the ApplicationScope or `EVT.App`. EVT.App
// is a sub-class of scope and it defines the public API that an App Api Key
// can access to.**

// An Application scope currently has access to:

// - Product resource (`R`)
// - App User resource (`C`)
// - Login
// - (`C` actions via products)

define([
  'core',
  './scope',
  'resource',
  'entity/product',
  'entity/appUser',
  'authentication',
  'social/facebook',
  'utils',
  'logger',
  'ajax'
], function (EVT, Scope, Resource, Product, AppUser,
             Authentication, Facebook, Utils, Logger) {
  'use strict';

  // Application Scope constructor. It can be called with the parameters:

  // - ***new EVT.App(apiKey)** - API Key string*
  // - ***new EVT.App(options)** - Options object should contain `apiKey`,
  // and optionally `facebook` boolean. Passing `facebook: true` automatically
  // initializes Facebook SDK with this application's FB App Id - setup in
  // EVRYTHNG's Dashboard Project Preferences.*
  var ApplicationScope = function(obj){

    var $this = this;

    // Setup base Scope with the provided API Key.
    if(Utils.isObject(obj)){
      Scope.call(this, obj.apiKey);
    }else{
      Scope.call(this, obj);
    }

    // Get app information asynchronously from the Engine using already
    // defined scope. Use **new EVT.App('apiKey').$init.then(success)** if need
    // to wait for app information.
    this.$init = EVT.api({
      url: '/applications',
      authorization: this.apiKey
    }).then(function (apps) {

      // Apps return array of a single application that matches this
      // API Key. The response's API Key is defined in property `appApiKey`
      // instead of `apiKey`, so remove it to prevent redundant apiKey
      // properties in the scope. Also, attach app details into the scope.
      delete apps[0].appApiKey;
      return Utils.extend($this, apps[0], true);

    }, function () {
      Logger.error('There is no application with this API Key.');

    }).then(function (app) {

      // If using Facebook, the $init promise is only resolved after FB
      // is initialized and user login status is retrieved. In this situation,
      // the resolved object of `$init` is a wrapped object:

      // ```
      //  {
      //    status: <Facebook's connected status>,
      //    authResponse: <Facebook's auth response>,
      //    user: {
      //      facebook: { <Facebook's user info>}
      //      <Evrythng's user information>
      //    },
      //    app: {
      //      <Evrythng's app information>
      //    }
      //  }
      // ```
      if(obj.facebook){

        // Get Facebook App ID from the Evrythng App social networks list.
        return Facebook.init(app.socialNetworks.facebook.appId)
          .then(function (response) {

            if(response.status === 'connected') {

              // If user is connected with Faceobok, return a promise with his details.
              return Authentication.authFacebook.call($this, response);

            } else {
              return response;
            }

          }).then(function (response) {

            // Add app information to the already wrapped object.
            return Utils.extend(response, { app: app });

          });

      }else{

        // If not using Facebook, simply return app details after they are received.
        return app;
      }

    });
  };

  // Setup Scope inheritance.
  ApplicationScope.prototype = Object.create(Scope.prototype);
  ApplicationScope.prototype.constructor = ApplicationScope;


  // Implement Public API by extending the prototype.

  // By default all resource constructors are themselves factory functions
  // that are called by the scopes, can receive an ID and return a Resource.
  // However, in some situations in our API, the output of different endpoints can
  // return be the same. Thus we need to setup the resource constructor to use a certain
  // path, and return the correct factory function. This is what happens here with the
  // **appUser()** resource constructor.
  Utils.extend(ApplicationScope.prototype, {

    product: Product.resourceConstructor,

    // Setup AppUser resource to use *'/auth/evrythng/users'* instead
    // of the default *'/users'*. Both endpoints return a list of User entities.
    appUser: AppUser.resourceConstructor('/auth/evrythng/users'),

    login: Authentication.login

  }, true);


  // Attach ApplicationScope class to the EVT module.
  EVT.App = ApplicationScope;

  return EVT;

});
