define([
  'utils'
], function (Utils) {
  'use strict';

  // Private properties
  // Version is udpated from package.json
  var version = '2.0.0';


  // Setup default settings:
  // - API URL: String, change the default API host
  // - Async: Boolean, set to false to block UI during requests
  // - FetchCascade: Boolean, set to true to automatically fetch nested entities
  // - OnStartRequest: Function, run before each HTTP call (e.g. start Spinner)
  // - OnFinishRequest: Function, run after each HTTP call
  // - Geolocation: Boolean, true to ask for Geolocation when needed (e.g. actions)
  var defaultSettings = {
    apiUrl: 'https://api.evrythng.com',
    async: true,
    fullResponse: false
    /*fetchCascade: false,
    onStartRequest: null,
    onFinishRequest: null,
    geolocation: true*/
  };


  // Module definition and public API
  var EVT = {
    version: version,

    settings: defaultSettings,

    setup: function (options) {
      if(Utils.isObject(options)){
        this.settings = Utils.extend(defaultSettings, options);
      }else{
        throw new TypeError('Setup should be called with an options object.');
      }

      return this.settings;
    }
  };

  return EVT;
});
