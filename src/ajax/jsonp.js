define([
  'core',
  'rsvp',
  'utils',
  'logger'
], function (EVT, RSVP, Utils, Logger) {
  'use strict';

  // Lightweight JSONP fetcher
  var counter = 0, head;

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

  function _load(url, async) {
    var script = document.createElement('script'),
      done = false;
    script.src = url;
    script.async = async;

    // On load, remove script from document
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

    // Actually load script
    head.appendChild( script );
  }


  function jsonp(options, successCallback, errorCallback) {
    /*jshint camelcase:false */

    options = options || {};

    if(options.url) {
      options.url = options.url.replace('//api', '//js-api');
    }

    var uniqueName = 'callback_json' + (++counter);

    // Send all data via GET request params
    var params = options.params || {};
    params.callback = uniqueName;
    params.access_token = options.authorization;
    params.method = options.method || 'get';
    params.data = JSON.stringify(options.data);
    options.params = params;

    var async = options.async !== undefined ? options.async : true,
      url = Utils.buildUrl(options);

    // Return a promise
    return new RSVP.Promise(function(resolve, reject) {

      // Response handler
      window[ uniqueName ] = function(response){
        if (response.errors && response.status) {

          var errorData = _buildError(url, response.status, params.method, response);
          Logger.error(errorData);

          if(errorCallback) { errorCallback(errorData); }
          reject(errorData);

        }else {

          if(successCallback) { successCallback(response); }
          resolve(response);

        }

        // Cleanup callback from window
        try {
          delete window[ uniqueName ];
        } catch (e) {}
        window[ uniqueName ] = null;
      };

      _load(url, async, reject);
    });
  }

  return jsonp;
});
