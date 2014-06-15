// ## SCOPE.JS

// **Scope defines the context in which API calls are made.
// Thus, it stores its defining API Key. Scopes send their
// respective `API Key` in their request's `Authorization` header.**

// *For example, reads on products using ApplicationScope or
// EVT.App only return the products created for that specific
// application/scope.*

define([
  'utils'
], function (Utils) {
  'use strict';

  // Scope super class constructor:

  // - ***new Scope(apiKey)** - API Key string*
  var Scope = function(apiKey){

    // Default parent scope does not have parent.
    this.parentScope = null;

    // Setup apiKey of the current Scope if it is a String.
    if(Utils.isString(apiKey)){
      this.apiKey = apiKey;
    }else{
      throw new TypeError('Scope constructor should be called with API Key.');
    }
  };

  // Return Scope factory function
  return Scope;

});
