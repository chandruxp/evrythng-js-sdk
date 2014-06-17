// ## CORS.JS

// **The Jsonp module implements a simple JSON-P fetcher. JSON-P is
// deprecated until IE<10 cease to exist and only works in browsers.**

// *This implementation is based on
// [Lightweight-JSONP](https://github.com/IntoMethod/Lightweight-JSONP).*

define([
  'core',
  'rsvp',
  'utils',
  'logger'
], function (EVT, RSVP, Utils, Logger) {
  'use strict';

  // Counter defines uniquely identified callbacks.
  var counter = 0, head;

  // Helper method that builds a custom Error object providing some extra
  // information on a request error.
  function _buildError(url, status, method, response){
    var errorData = {
      status: status,
      type: 'jsonp',
      message: 'Server responded with an error for the JSONP request',
      url: url,
      method: method
    };

    if(response) { errorData.errors = response.errors; }

    return errorData;
  }

  // Making the request is as simple as appending a new script tag
  // to the document. The URL has the *callback* parameter with the
  // function that will be called with the repsonse data and *async* flag
  // tells if the request should be synchronous and block the UI or not.
  function _load(url, async) {

    var script = document.createElement('script'),
      done = false;
    script.src = url;
    script.async = async;

    // Once the script has been loaded remove the tag from the document.
    script.onload = script.onreadystatechange = function() {
      if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
        done = true;
        script.onload = script.onreadystatechange = null;
        if ( script && script.parentNode ) {
          script.parentNode.removeChild( script );
        }
      }
    };

    if ( !head ) {
      head = document.getElementsByTagName('head')[0];
    }

    // Actually load script.
    head.appendChild( script );
  }


  // Jsonp method sets prepares the script url with all the information
  // provided and defines the callback handler.
  function jsonp(options, successCallback, errorCallback) {
    /*jshint camelcase:false */

    options = options || {};

    // Evrythng REST API default endpoint does not provide JSON-P
    // support, which '//js-api.evrythng.com' does.
    if(options.url) {
      options.url = options.url.replace('//api', '//js-api');
    }

    // Define unique callback name.
    var uniqueName = 'callback_json' + (++counter);


    // Send all data (including method, api key and data) via GET
    // request params.
    var params = options.params || {};
    params.callback = uniqueName;
    params.access_token = options.authorization;
    params.method = options.method || 'get';
    params.data = JSON.stringify(options.data);
    options.params = params;

    var async = options.async !== undefined ? options.async : true,
      url = Utils.buildUrl(options);


    // Return a promise and resolve/reject it in the callback function.
    return new RSVP.Promise(function(resolve, reject) {

      // Attach callback as a global method. Evrythng's REST API error
      // responses always have a status and array of errors.
      window[uniqueName] = function(response){

        if (response.errors && response.status) {

          var errorData = _buildError(url, response.status, params.method, response);
          Logger.error(errorData);

          if(errorCallback) { errorCallback(errorData); }
          reject(errorData);

        }else {

          if(successCallback) { successCallback(response); }
          resolve(response);

        }

        // Remove callback from window.
        try {
          delete window[uniqueName];
        } catch (e) {}
        window[uniqueName] = null;
      };

      _load(url, async, reject);

    });
  }

  return jsonp;

});
