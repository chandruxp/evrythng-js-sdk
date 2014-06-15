define([
  '../core',
  './scope',
  'entity/product',
  'entity/thng',
  'entity/action',
  'entity/appUser',
  'entity/collection',
  'authentication',
  'utils'
], function (EVT, Scope, Product, Thng, Action, AppUser, Collection, Authentication, Utils) {
  'use strict';

  // User Scope constructor
  // - obj contains user information
  var UserScope = function(obj, parentScope){

    // Setup base Scope
    if(Utils.isObject(obj)){
      Scope.call(this, obj.apiKey);
      Utils.extend(this, obj, true);
    }else{
      Scope.call(this, obj);
    }

    if(parentScope instanceof Scope) {
      this.parentScope = parentScope;
    }

  };

  // setup inheritance
  UserScope.prototype = Object.create(Scope.prototype);
  UserScope.prototype.constructor = UserScope;


  function search(query, options) {
    var params = {};

    if(Utils.isString(query)) {
      params.q = query;
      params = Utils.extend(params, options);

    } else {
      params = query;

      if(options) {
        Utils.extend(params, options, true);
      }
    }

    return EVT.api({
      url: '/search',
      params: params,
      authorization: this.apiKey
    });
  }

  function update() {
    var $this = this,
      self = AppUser.resourceConstructor().call(this, this.id);

    return self.update(arguments).then(function (updated) {
      Utils.extend($this, updated, true);
      return updated;
    });
  }


  // Implement Public API
  Utils.extend(UserScope.prototype, {

    product: Product.resourceConstructor,

    action: Action.resourceConstructor,

    thng: Thng.resourceConstructor(),

    collection: Collection.resourceConstructor,

    logout: Authentication.logout,

    search: search,

    update: update

  }, true);


  // Attach class
  EVT.User = UserScope;

  return EVT;
});
