// ## UTILS.JS

// **The Utils module provide a set of utility methods used
// across the whole library. For that, it doesn't have any
// dependency.**

define(function () {
  'use strict';

  return {

    // Check if a variable is a function.
    isFunction: function(fn){
      return Object.prototype.toString.call(fn) == "[object Function]";
    },

    // Check if a variable is a string.
    isString: function(str){
      return Object.prototype.toString.call(str) == "[object String]";
    },

    // Check if a variable is an array.
    isArray: function(arr){
      return Object.prototype.toString.call(arr) == "[object Array]";
    },

    // Check if a variable is an Object (includes Object functions and
    // plain objects)
    isObject: function(obj) {
      return obj === Object(obj) && !this.isArray(obj);
    },

    // Simple and shallow extend method, used to extend an object's properties
    // with another object's. The `override` parameter defines if the
    // source object should be overriden or if this method should return a new
    // object (it is *false by default*).
    extend: function(source, obj, override) {
      var out;

      // Create extensible object.
      if(override) {
        out = source;
      } else {
        // Create shallow copy of source.
        out = {};
        for(var i in source){
          out[i] = source[i];
        }
      }

      // Copy properties.
      for(var j in obj) {
        if(obj.hasOwnProperty(j)) {
          out[j] = obj[j];
        }
      }

      return out;
    },

    // Build URL query string params out of a javascript object.
    // Encode key and value components as they are appended to query string.
    buildParams: function (params) {
      var paramsStr = [];

      for (var key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined) {
          paramsStr.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
      }

      // Build string from the array.
      return paramsStr.join('&');
    },

    // Build full URL from a base url and params, if there are any.
    buildUrl: function(options){
      var url = options.url || '';

      if(options.params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + this.buildParams(options.params);
      }

      return url;
    }

  };

});