// ## USER.JS

// **Here it is defined the UserScope or `EVT.User`. EVT.User
// is a sub-class of scope and it defines the public API that the
// user and its API Keys can access to.**

// A User scope currently has access to:

// - Product resource (`C`, `R`, `U`)
// - Action resource (`C`, `R`, `U`)
// - Thng resource (`C`, `R`, `U`)
// - Collection resource (`C`, `R`, `U`)
// - Logout
// - Search
// - Update itself (the user information)

define([
  'core',
  './scope',
  'entity/product',
  'entity/thng',
  'entity/action',
  'entity/appUser',
  'entity/collection',
  'authentication',
  'utils'
], function (EVT, Scope, Product, Thng, Action, AppUser, Collection,
             Authentication, Utils) {
  'use strict';

  // User Scope constructor. It can be called with the parameters:

  // - ***new EVT.User(apiKey, parentScope)** - API Key string.
  // Optional parent scope.*
  // - ***new EVT.User(options, parentScope)** - Options object should
  // contain `apiKey` and optionally user information (user entity retrieved
  // from the engine). Optional parent scope.*
  var UserScope = function(obj, parentScope){

    // Setup base Scope with the provided API Key.
    if(Utils.isObject(obj)){
      Scope.call(this, obj.apiKey);

      // Merge user information into the scope, as we do with the ApplicationScope.
      Utils.extend(this, obj, true);

    }else{
      Scope.call(this, obj);
    }

    // Store parent scope. *Currently not used.*
    if(parentScope instanceof Scope) {
      this.parentScope = parentScope;
    }

  };

  // Setup Scope inheritance.
  UserScope.prototype = Object.create(Scope.prototype);
  UserScope.prototype.constructor = UserScope;


  // Wrap the search API call in the search() method. Check the
  // [search API in Evrythng Documentation](https://dev.evrythng.com/documentation/api#search).
  // .search() allows the following parameters:

  // - ***search(queryString, options)** - ?q=queryString. Options object represent
  // the additional search parameters. Such as:*

  // ```
  //  {
  //    types: 'thng,product'
  //  }
  // ```

  // - ***search(queryObj, options)** - Apply field or geographic search. Such as:*

  // ```
  //  {
  //    name: 'tv',
  //    description: 'plasma'
  //  }
  // ```

  // ```
  //  {
  //    lat: 72,000
  //    long: -0,190
  //    maxDistance: 5
  //  }
  // ```

  // - ***search(queryOptions)** - Merge all search parameters in a single object*
  function search(query, options) {
    var params = {};

    // Use Free-text search using query string and additional parameters.
    if(Utils.isString(query)) {
      params.q = query;
      params = Utils.extend(params, options);

    } else {
      params = query;

      // Merge query and additional options in a single object for the request.
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

  // Allow to update the current user without an explicit API call. Simply update
  // the user scope object and call update will make the request to update the user
  // in the *'/users'* endpoint.
  function update() {
    var $this = this,
      self = AppUser.resourceConstructor().call(this, this.id);

    return self.update(arguments).then(function (updated) {
      Utils.extend($this, updated, true);
      return updated;
    });
  }


  // Implement Public API by extending the prototype.

  // See explanation of resource constructors in ApplicationScope. The
  // **thng()** resource builds a custom resource constructor by using
  // the default *'/thngs'* endpoint.
  Utils.extend(UserScope.prototype, {

    product: Product.resourceConstructor,

    action: Action.resourceConstructor,

    // Thngs can be retrieved from multiple endpoints. In here we create
    // a custom resource constructor using the default path.
    thng: Thng.resourceConstructor(),

    collection: Collection.resourceConstructor,

    logout: Authentication.logout,

    search: search,

    update: update

  }, true);


  // Attach UserScope class to the EVT module.
  EVT.User = UserScope;

  return EVT;

});
