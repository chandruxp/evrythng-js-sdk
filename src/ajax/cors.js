define([
  'core',
  'rsvp',
  'utils',
  'logger'
], function (EVT, RSVP, Utils, Logger) {
  'use strict';

  function _buildResponse(xhr, withFullResponse){
    var response = xhr.responseText? JSON.parse(xhr.responseText) : null;

    // Wrap response in object with headers
    if(withFullResponse){
      response = {
        data: response,
        headers: xhr.responseHeaders,
        status: xhr.status
      };
    }

    return response;
  }

  function _buildError(xhr, url, method, response){
    var errorData = {
      status: xhr.status,
      type: 'cors',
      message: 'Server responded with an error for the CORS request',
      url: url,
      method: method
    };

    if(response) { errorData.errors = response.errors; }

    return errorData;
  }

  // Nicholas Zakas in http://www.html5rocks.com/en/tutorials/cors/
  function _createXhr(method, url, async) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open(method, url, async);

    } else {

      // Otherwise, CORS is not supported by the browser.
      // IEs XDR does not support custom headers, including Authentication
      // which means its useless for us. Use Jsonp instead.
      xhr = null;
    }
    return xhr;
  }

  // Make the actual CORS request. Options:
  // - method: String
  // - url: String
  // - authorization: String
  // - accept: String
  // - fullResponse: Boolean
  // - success: Function
  // - error: Function
  function cors(options, successCallback, errorCallback){
    options = options || {};

    var method = options.method || 'get',
      async = options.async !== undefined ? options.async : true,
      url = Utils.buildUrl(options),
      xhr = _createXhr(method, url, async);

    if (xhr) {

      // Data to send in request
      var data = options.data ? JSON.stringify(options.data) : null,
        successCb, errorCb;

      // TODO: pass this verification to EVT.api()
      // Setup Success Callback (priority to second parameter)
      if(Utils.isFunction(successCallback)){
        successCb = successCallback;
      }else if(Utils.isFunction(options.success)){
        successCb = options.success;
      }

      // Setup Error Callback (priority to third parameter)
      if(Utils.isFunction(errorCallback)){
        errorCb = errorCallback;
      }else if(Utils.isFunction(options.error)){
        errorCb = options.error;
      }


      // Setup headers
      xhr.setRequestHeader('Content-Type', 'application/json');
      if(options.accept) { xhr.setRequestHeader('Accept', options.accept); }
      if(options.authorization) { xhr.setRequestHeader('Authorization', options.authorization); }


      // If request is made synchronously, return direct response or error
      if(!async){

        // Request blocks the UI until it's finished
        xhr.send(data);

        var response = _buildResponse(xhr, options.fullResponse);

        if(xhr.status >= 200 && xhr.status < 300) {
          return response;
        } else {
          Logger.error(_buildError(xhr, url, method, response));
          throw new Error('CORS Request failed. View log for more info.');
        }

      }else{
        // Do a normal asynchronous request and return a promise. If there
        // are callbacks execute then as well, before resolving the promise.
        return new RSVP.Promise(function(resolve, reject) {

          // Response handler
          function handler() {
            if (this.readyState === this.DONE) {
              var response = _buildResponse(this, options.fullResponse);

              // Resolve or reject promise given the response status
              if (this.status >= 200 && this.status < 300) {
                if(successCb) { successCb(response); }
                resolve(response);

              } else {
                var errorData = _buildError(this, url, method, response);
                Logger.error(errorData);

                if(errorCb) { errorCb(errorData); }
                reject(errorData);
              }
            }
          }

          // Send request
          xhr.onreadystatechange = handler;
          xhr.send(data);
        });
      }

    } else {
      var ex = new Error('CORS not supported.');
      ex.name = 'CorsError';
      throw ex;
    }
  }

  return cors;
});
