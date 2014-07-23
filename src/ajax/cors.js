// ## CORS.JS

// **The Cors module implements a simple CORS request using *XmlHttpRequest*.
// For browsers that don't properly support CORS (XHR2) we use JSON-P
// instead.**

// **In Node.js the *XmlHttpRequest* is proxied using the `w3c-xmlhttprequest`
// dependency, which is installed when installing EvrythngJS NPM package.**

// *This implementation is based on Nicholas Zakas' in
// [html5rocks](http://www.html5rocks.com/en/tutorials/cors/).*

define([
  'core',
  'npo',
  'utils',
  'logger'
], function (EVT, Promise, Utils, Logger) {
  'use strict';

  // Helper method used to build the returned response. It parses the JSON
  // 'data' response and wraps the 'status' and 'headers' in an object in
  // case the flag `fullResponse` is enabled as a global in `EVT.settings`
  // or in this particular request. *200 OK* responses without data,
  // return *null*.
  function _buildResponse(xhr, fullResponse){

    var response = xhr.responseText? JSON.parse(xhr.responseText) : null;

    if(fullResponse){
      response = {
        data: response,
        headers: xhr.responseHeaders,
        status: xhr.status
      };
    }

    return response;
  }

  // Helper method that builds a custom Error object providing some extra
  // information on a request error.
  function _buildError(xhr, url, method, response){
    var errorData = {
      status: xhr.status,
      type: 'cors',
      message: 'Server responded with an error for the CORS request',
      url: url,
      method: method
    };

    // Evrythng's API return an array of errors in the response. Add them
    // if available.
    if(response) { errorData.errors = response.errors; }

    return errorData;
  }


  // Create an XHR2 object, if possible. The request will be synchronous or
  // asynchronous based on the global `async` flag in `EVT.settings` or in
  // this particular request.
  function _createXhr(method, url, async) {

    var xhr = new XMLHttpRequest();

    // Check if the XMLHttpRequest object has a *withCredentials* property.
    // *withCredentials* only exists on XmlHttpRequest2 objects.
    if ("withCredentials" in xhr) {

      xhr.open(method, url, async);

    } else {

      // Otherwise, 'CORS is not supported by the browser'. IEs pseudo-XDR
      // does not support custom headers, including *Authorization*, which
      // means it is useless for us. Use JSON-P instead.
      xhr = null;

    }

    return xhr;
  }


  // Make the actual CORS request. Options available are defined in the [`ajax`
  // module doc](../ajax.html). Default method is `GET`, URL is relative to
  // `EVT.settings.apiUrl`, it is asynchronous by default and returns the
  // JSON data response.
  function cors(options, successCallback, errorCallback){

    options = options || {};

    var method = options.method || 'get',
      async = options.async !== undefined ? options.async : true,
      url = Utils.buildUrl(options),
      xhr = _createXhr(method, url, async);

    if (xhr) {

      // Send serialized JSON data.
      var data = options.data ? JSON.stringify(options.data) : null;

      // Setup headers, including the *Authorization* that holds the Api Key.
      xhr.setRequestHeader('Content-Type', 'application/json');
      if(options.authorization) { xhr.setRequestHeader('Authorization', options.authorization); }


      // If request is made synchronously, return direct response or error.
      // Synchronous requests don't use callbacks.

      // **Note: Synchronous requests block the UI until result is received!**
      if(!async){

        xhr.send(data);

        // At this point, response was already received.
        var response = _buildResponse(xhr, options.fullResponse);

        // HTTP status of 2xx is considered a success.
        if(xhr.status >= 200 && xhr.status < 300) {
          return response;
        } else {
          Logger.error(_buildError(xhr, url, method, response));
          throw new Error('Synchronous CORS Request failed.');
        }

      }else{

        // Do a normal asynchronous request and return a promise. If there
        // are callbacks execute them as well before resolving the promise.
        return new Promise(function(resolve, reject) {

          // Define the response handler.
          function handler() {
            if (this.readyState === this.DONE) {

              var response = _buildResponse(this, options.fullResponse);

              // Resolve or reject promise given the response status.
              // HTTP status of 2xx is considered a success.
              if (this.status >= 200 && this.status < 300) {

                if(successCallback) { successCallback(response); }
                resolve(response);

              } else {

                var errorData = _buildError(this, url, method, response);
                Logger.error(errorData);

                if(errorCallback) { errorCallback(errorData); }
                reject(errorData);

              }

            }
          }

          // Send the request and wait for the response in the handler.
          xhr.onreadystatechange = handler;
          xhr.send(data);

        });
      }

    } else {

      // Unable to create XHR2 object. Throw recognizable 'CorsError' exception
      var ex = new Error('CORS not supported.');
      ex.name = 'CorsError';
      throw ex;

    }
  }

  return cors;

});
