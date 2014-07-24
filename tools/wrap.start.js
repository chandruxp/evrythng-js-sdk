(function (root, factory) {

  // AMD. Register as an anonymous module.
  if (typeof define === 'function' && define.amd) {
    define(factory(XMLHttpRequest));

  // Node.js (CommonJS)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('w3c-xmlhttprequest').XMLHttpRequest);

  // Browser globals
  } else {
    root.EVT = root.Evrythng = factory(XMLHttpRequest);
  }

}(this, function (XMLHttpRequest) {
