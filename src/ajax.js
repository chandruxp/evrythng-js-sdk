// ## AJAX.JS

// **The Ajax module attaches the api() method to the EVT module.
// It controls the raw request to the API, first by trying a CORS
// request and if it fails, continuing with JSON-P.**

define([
  'core',
  'ajax/cors',
  'ajax/jsonp',
  'utils',
  'logger'
], function (EVT, cors, jsonp, Utils, Logger) {
  'use strict';

  // The ajax() method or EVT.api() returns a **Promise**. Nevertheless,
  // it still allows the old-styled callback API as follows:

  // - ***EVT.api(options)** - options object can contain `success` or `error`
  // properties to define success and error callbacks*
  // - ***EVT.api(options, successCb, errorCb)***

  // Options available are:

  // ```
  // fullResponse - override fullResponse global setting (see module `core`)
  // async - override async global setting (see module `core`)
  // url - URL of the request, relative to `EVT.settings.apiUrl`
  // method - HTTP method, default: `GET`
  // authorization - Authorization header content, should contain API Key
  // success - success handler function
  // error - error handler function
  // ```
  function ajax(options, successCallback, errorCallback) {

    // Merge options with defaults setup in EVT.settings.
    var requestOptions = Utils.extend({
      async: EVT.settings.async,
      fullResponse: EVT.settings.fullResponse
    }, options);

    requestOptions.url = EVT.settings.apiUrl + requestOptions.url;


    // Setup callbacks giving priority to parameters.
    var successCb, errorCb;

    if(Utils.isFunction(successCallback)){
      successCb = successCallback;
    }else if(Utils.isFunction(options.success)){
      successCb = options.success;
    }

    if(Utils.isFunction(errorCallback)){
      errorCb = errorCallback;
    }else if(Utils.isFunction(options.error)){
      errorCb = options.error;
    }


    // Returns a promise or imediate response if async = false.
    // Try to use XmlHttpRequest with CORS and fallback to JSON-P.
    try {

      return cors(requestOptions, successCb, errorCb);

    }catch(ex){

      // Re-throw error, if it is not a CORS problem.
      if(ex.name !== 'CorsError') { throw ex; }

      Logger.info('CORS not supported. Continuing with JSONP...');
      return jsonp(requestOptions, successCb, errorCb);
    }
  }

  // Attach ajax method to the EVT module.
  EVT.api = ajax;

  return EVT;

});
