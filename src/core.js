// ## CORE.JS

// **The Core module specifies the core EVT module and the client
// default settings. The library is built by adding functionality or
// sub-modules to EVT.**

define([
  'utils'
], function (Utils) {
  'use strict';

  // Version is udpated from package.json using `grunt-version` on build.
  var version = '2.0.3';


  // Setup default settings:

  // - ***apiUrl**: String - change the default API host*
  // - ***async**: Boolean - set to false to make synchronous requests (blocks UI)*
  // - ***fullResponse**: Boolean - by default the response of every call if the JSON
  // body. However if you need to access the 'status' or 'responseHeaders' in responses
  // set this to 'true'. The full response has the structure:*

  // ```
  //  {
  //    data: <JSON data>,
  //    headers: <response headers map>
  //    status: <HTTP status code>
  //  }
  // ```

  // - ***geolocation**: Boolean - set to true to ask for Geolocation when needed*
  // - ***fetchCascade**: Boolean - set to true to automagically fetch nested entities
  // (e.g. thng.product is an EVT.Product instead of string id)*
  // - ***onStartRequest**: Function - run before each HTTP call (e.g. start Spinner)*
  // - ***onFinishRequest**: Function - run after each HTTP call*
  var defaultSettings = {
    apiUrl: 'https://api.evrythng.com',
    async: true,
    fullResponse: false,
    geolocation: true
    /*fetchCascade: false,
    onStartRequest: null,
    onFinishRequest: null*/
  };


  // Module definition and raw API.
  var EVT = {
    version: version,

    settings: defaultSettings,

    // Setup method allows the developer to change overall settings for every
    // subsequent request. However, these can be overriden for each request as well.
    // Setup merges current settings with the new custom ones.
    setup: function (customSettings) {

      if(Utils.isObject(customSettings)){
        this.settings = Utils.extend(this.settings, customSettings);
      }else{
        throw new TypeError('Setup should be called with an options object.');
      }

      return this.settings;
    }
  };

  return EVT;

});
