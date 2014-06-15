define([
  'core',
  'scope/scope',
  'utils',
  'logger',
  'ajax'
], function (EVT, Scope, Utils, Logger) {
  'use strict';

  // Resource constructor
  var Resource = function(scope, path, classFn) {

    // Setup scope for each of the subsequent calls
    if(scope && scope instanceof Scope){
      this.scope = scope;
    } else {
      throw new TypeError('Scope must be instance of Scope (e.g. EVT.App).');
    }

    // Setup path
    if(Utils.isString(path)){
      if (path[0] != '/') { path = '/' + path; }
      this.path = path;
    } else {
      throw new TypeError('Resource must have a String path.');
    }

    // Setup class for serializing and deserializing results
    if(Utils.isFunction(classFn)){
      if (Utils.isFunction(classFn.prototype.toJSON)) {
        this['class'] = classFn;
      }else{
        Logger.error('Class for resource "' + path + '" does not implement toJSON().');
      }
    } else {
      Logger.info('Class for resource "' + path + '" undefined. It will not return ' +
        'proper Entities nor cascaded Entities.');
    }

  };


  function _request(requestOptions, userOptions, successCallback, errorCallback) {
    var successCb = successCallback,
      errorCb = errorCallback,
      request;

    if(Utils.isFunction(userOptions) || userOptions === null){
      successCb = userOptions;
      errorCb = successCallback;
    }else if (Utils.isObject(userOptions)) {
      requestOptions = Utils.extend(userOptions, requestOptions);
    }

    request = EVT.api(requestOptions, successCb, errorCb);
    return _handleResponse.call(this, request, userOptions, this.parse);
  }


  function _handleResponse(req, userOptions, success) {
    var async = (userOptions && userOptions.async !== undefined) ? userOptions.async : EVT.settings.async;

    if(async){
      var $this = this;

      // The success callback below is called from RSVP in a completely different
      // context. So we should explicitly pass this Resource context to the success call.
      return req.then(function (response) {
        return success.call($this, response);
      });

      // By not providing a error interceptor, we will let the error propagate
      // from EVT.api to the .read() error handler

    } else {
      return req;
    }
  }


  /**
   * Define the Resource API
   */
    // Create class instance from provided json object data, if possible
  Resource.prototype.parse = function (jsonData) {
    if(this['class'] && jsonData){
      if(Utils.isArray(jsonData)) {
        var ret = [];
        for(var i in jsonData){
          ret.push(new this['class'](jsonData[i], this));
        }
        return ret;
      } else {
        return new this['class'](jsonData, this);
      }
    } else {
      return jsonData;
    }
  };

  // Return the json object part of the class
  Resource.prototype.jsonify = function (classObject) {
    if(this['class'] && (classObject instanceof this['class'])){
      return classObject.toJSON();
    } else {
      return classObject;
    }
  };

  // Send POST request to the api for the given path
  // .create() interface:
  // - .create(data) <- no options, no callbacks
  // - .create(data, options) <- no callbacks or included in options
  // - .create(data, options, successCb, errorCb) <- all explicit
  // - .create(data, successCb, errorCb) <- no options
  Resource.prototype.create = function (data, options, successCallback, errorCallback) {
    if(!data || Utils.isFunction(data)){
      throw new TypeError('Create method should have payload.');
    }

    var requestOptions = {
      url: this.path,
      method: 'post',
      authorization: this.scope.apiKey,
      data: this.jsonify(data)
    };

    return _request.call(this, requestOptions, options, successCallback, errorCallback);
  };

  // Send GET request to the api for the given path
  // .read() interface:
  // - .read()
  // - .read(options)
  // - .read(options, successCb, errorCb)
  // - .read(successCb, errorCb)
  Resource.prototype.read = function (options, successCallback, errorCallback) {
    var requestOptions = {
      url: this.path,
      authorization: this.scope.apiKey
    };

    return _request.call(this, requestOptions, options, successCallback, errorCallback);
  };

  // Send PUT request to the api for the given path
  // .update() interface:
  // - .update(data) <- no options, no callbacks
  // - .update(data, options) <- no callbacks or included in options
  // - .update(data, options, successCb, errorCb) <- all explicit
  // - .update(data, successCb, errorCb) <- no options
  Resource.prototype.update = function (data, options, successCallback, errorCallback) {
    var requestOptions = {
      url: this.path,
      method: 'put',
      authorization: this.scope.apiKey,
      data: this.jsonify(data)
    };

    return _request.call(this, requestOptions, options, successCallback, errorCallback);
  };

  // Send DELETE request to the api for the given path
  Resource.prototype['delete'] = function (options, successCallback, errorCallback) {
    var requestOptions = {
      url: this.path,
      method: 'delete',
      authorization: this.scope.apiKey
    };

    return _request.call(this, requestOptions, options, successCallback, errorCallback);
  };

  return Resource;
});