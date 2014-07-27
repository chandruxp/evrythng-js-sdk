// ## RESOURCE.JS

// **The private Resource module setups up the base resource CRUD methods.
// All requests made on a resource are scoped, meaning they will send the
// resouce's owner scope's API Key.**

// **Another important feature is that if the resource has a class/entity, which
// it allows to serialize and deserialize requests and responses. Also, with the
// `fetchCascade` option enabled, an entity knows how to automatically fetch nested
// entities.**

// *For example, the result of a .read() can be a Thng entity, that has specific
// methods to update itself, get the corresponding product or manage properties.*

define([
  'core',
  'scope/scope',
  'utils',
  'logger',
  'ajax'
], function (EVT, Scope, Utils, Logger) {
  'use strict';

  // Resource constructor. As this is a private module, all resource constructors
  // are called within scopes. It accepts:

  // - ***scope**: scope that owns this resource (`EVT.App`, `EVT.User`)*
  // - ***path**: relative path to `EVT.settings.apiUrl` of this resource.
  // It can represent a list or a single object (e.g. '/thngs', '/thngs/1')*
  // - ***classFn**: class of the current resource, used to serialize/deserialize
  // requests/responses. If the response does not need special treatment and the
  // JSON representation is enough, the classFn can be omitted.*
  var Resource = function(scope, path, classFn) {

    // Setup scope for each of the subsequent calls.
    if(scope && scope instanceof Scope){
      this.scope = scope;
    } else {
      throw new TypeError('Scope should inherit from Scope (e.g. EVT.App).');
    }

    // Setup path and allow to omit leading '/'.
    if(Utils.isString(path)){

      if (path[0] != '/') { path = '/' + path; }
      this.path = path;

    } else {
      throw new TypeError('Resource must have a String path.');
    }

    // Setup class for serializing and deserializing results. It must implement
    // a *toJSON()* method. This method is in the Entity prototype. Since all of our
    // entities inherit from Entity, by default all of them will have this.
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


  // Helper method to prepare and handle a request giving the parameters passed to
  // any of the resource methods. Allow to have callbacks as separate parameters or
  // included in the options object, providing exactly the same interface as `EVT.api()`.
  function _request(requestOptions, userOptions, successCallback, errorCallback) {
    var successCb = successCallback,
      errorCb = errorCallback,
      request;

    // This verification allows not to pass any options, and have callbacks in
    // its place. It also allows passing *null* if there is no success callback.
    if(Utils.isFunction(userOptions) || userOptions === null){

      successCb = userOptions;
      errorCb = successCallback;

    }else if (Utils.isObject(userOptions)) {

      // If options is an object, merge it with the request options. Callbacks
      // can be included in this object or as separate parameters (same as
      // `EVT.api()`).
      requestOptions = Utils.extend(userOptions, requestOptions);

    }

    // Actually make the request and handle its response, by forwarding to
    // the raw `EVT.api()` method.
    request = EVT.api(requestOptions, successCb, errorCb);

    return _handleResponse.call(this, request, userOptions);
  }

  // Handle synchronous or asynchronous requests based on the custom or
  // default options.
  function _handleResponse(request, userOptions) {
    var async = (userOptions && userOptions.async !== undefined) ?
      userOptions.async : EVT.settings.async;

    if(async){

      var $this = this;

      // If request is async, and before returning the response, parse it.
      // This success handler is called inside the Promise, so we need to
      // keep the current context.

      // Also, By not providing an error interceptor, we will let the error
      // propagate from `EVT.api()` to the `resource.read()` promise error
      // handler
      return request.then(function (response) {
        return $this.parse(response);
      });

    } else {
      return request;
    }
  }


  // ### Resource API

  // Any resource create in a scope will inherit these methods. However, it
  // is possible to add custom methods to a resource in a custom Entity
  // *resourceConstructor* (e.g. refer to the [`entity/appUser` doc](entity/appUser.html),
  // where a *.validate()* method is added to every AppUser resource).

  // **Remember that all CRUD methods forward to `EVT.api()` which returns a Promise.**

  // #### Parse

  // Parse a given JSON data or object into an instance of this resource's
  // class/entity, if possible. An entity always keeps a reference to its
  // mother resource, in order to alias methods (e.g. the *entity.update()*
  // method calls the mother *resource.update(entity.toJSON())* ).
  Resource.prototype.parse = function (jsonData) {

    if(this['class'] && jsonData){

      if(Utils.isArray(jsonData)) {

        // If response is an array, also create array of entities. For
        // each, we need a new Resource with single path.
        var ret = [];
        for(var i in jsonData){
          if(jsonData.hasOwnProperty(i)){
            var objId = jsonData[i].id, resource = this;

            if(objId){
              resource = new Resource(this.scope, this.path + '/' + objId, this['class']);
            }

            ret.push(new this['class'](jsonData[i], resource));
          }
        }
        return ret;

      } else {
        return new this['class'](jsonData, this);
      }

    } else {
      return jsonData;
    }

  };


  // #### Jsonify

  // The opposite of parse. It takes an entity and returns only the JSON
  // part of it, used to make the calls to the REST API. If the passed object
  // is a plain object, do nothing.
  Resource.prototype.jsonify = function (classObject) {

    if(this['class'] && (classObject instanceof this['class'])){
      return classObject.toJSON();
    } else {
      return classObject;
    }

  };


  // #### Create

  // Create sends a `POST` request to the REST API with the provided object data.
  // It always returns an entity or JSON object on success. It accepts the
  // following parameters:

  // - ***create(data)**: just send data (entity or plain JSON), no options,
  // no callbacks*
  // - ***create(data, options)**: no callbacks or they are included in options*
  // - ***create(data, options, successCb, errorCb)**: all explicit params*
  // - ***create(data, successCb, errorCb)**: no options, just callbacks*
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


  // #### Read

  // Read sends a `GET` request to the REST API. It always returns an entity
  // or JSON object on success. It accepts the following parameters:

  // - ***read()**: no options, no callbacks*
  // - ***read(options)**: no callbacks or they are included in options*
  // - ***read(options, successCb, errorCb)**: all explicit params*
  // - ***read(successCb, errorCb)**: no options, just callbacks*
  Resource.prototype.read = function (options, successCallback, errorCallback) {

    var requestOptions = {
      url: this.path,
      authorization: this.scope.apiKey
    };

    return _request.call(this, requestOptions, options, successCallback, errorCallback);

  };


  // #### Update

  // Update sends a `PUT` request to the REST API. It always returns an entity
  // or JSON object on success.

  // **The interface is the same as *.create()***
  Resource.prototype.update = function (data, options, successCallback, errorCallback) {

    if(!data || Utils.isFunction(data)){
      throw new TypeError('Update method should have payload.');
    }

    var requestOptions = {
      url: this.path,
      method: 'put',
      authorization: this.scope.apiKey,
      data: this.jsonify(data)
    };

    return _request.call(this, requestOptions, options, successCallback, errorCallback);

  };


  // #### Delete

  // Delete sends a `DELETE` request to the REST API. It always returns an *null*
  // response on success.

  // **The interface is the same as *.read()***
  Resource.prototype['delete'] = function (options, successCallback, errorCallback) {

    var requestOptions = {
      url: this.path,
      method: 'delete',
      authorization: this.scope.apiKey
    };

    return _request.call(this, requestOptions, options, successCallback, errorCallback);

  };


  // Given we don't have subclasses of Resource, this static factory method
  // allows to generate a resource constructor given a path and class.

  // By default all resource constructors receive a string ID for single
  // entity resources.
  Resource.constructorFactory = function (path, classFn) {
    return function (id) {
      var fullPath = path || "";

      if(id){
        if(Utils.isString(id)) {
          fullPath += '/' + id;
        } else {
          throw new TypeError('ID must be a string');
        }
      }

      return new Resource(this, fullPath, classFn);
    };
  };


  return Resource;

});