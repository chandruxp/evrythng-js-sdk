define([
  'core',
  'ajax/cors',
  'ajax/jsonp',
  'utils',
  'logger'
], function (EVT, corsRequest, jsonpRequest, Utils, Logger) {
  'use strict';

  // EVT.api interface:
  // - EVT.api(obj)
  // - EVT.api(obj, successCb, errorCb)
  function ajaxRequest(options, successCallback, errorCallback) {
    // Merge options with defaults
    var requestOptions = Utils.extend({
      async: EVT.settings.async,
      fullResponse: EVT.settings.fullResponse
    }, options);

    requestOptions.url = EVT.settings.apiUrl + requestOptions.url;

    // Returns the Promise or imediate response if async = false.
    // Fallback to Jsonp.
    try {
      return corsRequest(requestOptions, successCallback, errorCallback);
    }catch(ex){
      if(ex.name != 'CorsError') { throw ex; }

      Logger.info('CORS not supported. Continuing with JSONP...');
      return jsonpRequest(requestOptions, successCallback, errorCallback);
    }
  }

  EVT.api = ajaxRequest;

  return EVT;
});
