define(function () {
  'use strict';

  function _console(type, data){
    if(!console) { return; }

    if (type === 'error') {
      console.error('EvrythngJS Error: ', data);
    } else {
      console.info('EvrythngJS Info: ', data);
    }
  }


  return {
    error: function(data){
      return _console('error', data);
    },

    info: function(data){
      return _console('info', data);
    }
  };
});