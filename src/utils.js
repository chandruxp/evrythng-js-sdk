define(function () {
  'use strict';

  function _object(source, override) {
    var out;
    if(override) {
      out = source;
    } else {
      out = {};
      for(var i in source){
        out[i] = source[i];
      }
    }
    return out;
  }

  // Helper functions needed to build the module
  return {
    isFunction: function(fn){
      return Object.prototype.toString.call(fn) == "[object Function]";
    },

    isString: function(str){
      return Object.prototype.toString.call(str) == "[object String]";
    },

    isArray: function(arr){
      return Object.prototype.toString.call(arr) == "[object Array]";
    },

    isObject: function(obj) {
      return obj === Object(obj) && !this.isArray(obj);
    },

    extend: function(source, obj, override) {
      var out = _object(source, override);

      for(var j in obj) {
        if(obj.hasOwnProperty(j)) {
          out[j] = obj[j];
        }
      }

      return out;
    },

    // Helper method to build query string
    buildParams: function (params) {
      var paramsStr = [];
      for (var key in params) {
        if (params.hasOwnProperty(key) && params[key] !== undefined) {
          paramsStr.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
        }
      }
      return paramsStr.join('&');
    },

    buildUrl: function(options){
      var url = options.url || '';

      if(options.params) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + this.buildParams(options.params);
      }

      return url;
    }
  };
});