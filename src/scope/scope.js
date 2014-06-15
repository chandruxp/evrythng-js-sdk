define([
  'utils'
], function (Utils) {
  'use strict';

  // Scope constructor
  // see https://gist.github.com/jonnyreeves/2474026 for example
  var Scope = function(apiKey){

    this.parentScope = null;

    // Setup apiKey of the current Scope
    if(Utils.isString(apiKey)){
      this.apiKey = apiKey;
    }else{
      throw new TypeError('Scope constructor should be called with API Key.');
    }
  };

  return Scope;
});
