// ## LOGGER.JS

// **The Logger module is simple wrapper for console log
// that prefixes EvrythngJS's logs with a custom header.**

define(function () {
  'use strict';

  var header = 'EvrythngJS';

  return {

    error: function(data){
      console.error(header + ' Error: ', data);
    },

    info: function(data){
      console.info(header + ' Info: ', data);
    }

  };

});