// # **[EVRYTHNG](https://www.evrythng.com)'s JavaScript SDK**

// ## EVRYTHNG.JS

// EvrythngJS uses AMD ([RequireJS](http://requirejs.org/)) to load all of its
// building modules.

// This is the higher level module that requires the `EVT.App`
// and `EVT.User` classes representing the Application and User scopes respectively.
// All other modules are loaded as dependencies of these two.

// ### UMD

// EvrythngJS is wrapped in a [UMD](https://github.com/umdjs/umd) definition which makes it
// available as an **AMD** (RequireJS) module, **CommonJS** (Node.js) or **browser globals**.

// EvrythngJS bundle also includes:

// - [Almond](https://github.com/jrburke/almond): a minimal AMD script loader
// - [RSVP](https://github.com/tildeio/rsvp.js): a lightweight Promises/A+ (1.1) library

// See the full [uncompressed library](https://github.com/evrythng/evrythng-js-sdk/tree/master/dist/evrythng.js) @ Github.

define([
  "scope/application",
  "scope/user"
], function(EVT) {
  'use strict';

  // Return fully built EVT module.
  return EVT;

});
