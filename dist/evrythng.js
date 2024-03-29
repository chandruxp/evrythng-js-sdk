// EVRYTHNG JS SDK v2.0.5

// (c) 2012-2014 EVRYTHNG Ltd. London / New York / Zurich.
// Released under the Apache Software License, Version 2.0.
// For all details and usage:
// https://github.com/evrythng/evrythng-js-sdk.

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
// Almond.js
// ---------

// Almond is packaged into evrythng.js providing a minimal AMD wrapper,
// useful for mobile devices. Thus, evrythng.js does not depend on RequireJS.

/**
 * almond 0.1.2 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice,
        main, req;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {},
            nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part;

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            return true;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, ret, map, i;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                    cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/*! Native Promise Only
    v0.7.5-e (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

define('npo',[],function () {
	/*jshint validthis:true */
	

	var cycle, scheduling_queue, ToString = Object.prototype.toString,
		timer = (typeof setImmediate != "undefined") ?
			function timer(fn) { return setImmediate(fn); } :
			setTimeout,
		builtInProp = Object.defineProperty ?
			function builtInProp(obj,name,val,config) {
				return Object.defineProperty(obj,name,{
					value: val,
					writable: true,
					configurable: config !== false
				});
			} :
			function builtInProp(obj,name,val) {
				obj[name] = val;
				return obj;
			}
	;

	// Note: using a queue instead of array for efficiency
	scheduling_queue = (function Queue() {
		var first, last, item;

		function Item(fn,self) {
			this.fn = fn;
			this.self = self;
			this.next = void 0;
		}

		return {
			add: function add(fn,self) {
				item = new Item(fn,self);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function drain() {
				var f = first;
				first = last = cycle = void 0;

				while (f) {
					f.fn.call(f.self);
					f = f.next;
				}
			}
		};
	})();

	function schedule(fn,self) {
		scheduling_queue.add(fn,self);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	// promise duck typing
	function isThenable(o) {
		var _then, o_type = typeof o;

		if (o != null &&
			(
				o_type == "object" || o_type == "function"
			)
		) {
			_then = o.then;
		}
		return typeof _then == "function" ? _then : false;
	}

	function notify() {
		for (var i=0; i<this.chain.length; i++) {
			notifyIsolated(
				this,
				(this.state === 1) ? this.chain[i].success : this.chain[i].failure,
				this.chain[i]
			);
		}
		this.chain.length = 0;
	}

	// NOTE: This is a separate function to isolate
	// the `try..catch` so that other code can be
	// optimized better
	function notifyIsolated(self,cb,chain) {
		var ret, _then;
		try {
			if (cb === false) {
				chain.reject(self.msg);
			}
			else {
				if (cb === true) {
					ret = self.msg;
				}
				else {
					ret = cb.call(void 0,self.msg);
				}

				if (ret === chain.promise) {
					chain.reject(TypeError("Promise-chain cycle"));
				}
				else if (_then = isThenable(ret)) {
					_then.call(ret,chain.resolve,chain.reject);
				}
				else {
					chain.resolve(ret);
				}
			}
		}
		catch (err) {
			chain.reject(err);
		}
	}

	function resolve(msg) {
		var _then, def_wrapper, self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		try {
			if (_then = isThenable(msg)) {
				def_wrapper = new MakeDefWrapper(self);
				_then.call(msg,
					function $resolve$(){ resolve.apply(def_wrapper,arguments); },
					function $reject$(){ reject.apply(def_wrapper,arguments); }
				);
			}
			else {
				self.msg = msg;
				self.state = 1;
				if (self.chain.length > 0) {
					schedule(notify,self);
				}
			}
		}
		catch (err) {
			reject.call(def_wrapper || (new MakeDefWrapper(self)),err);
		}
	}

	function reject(msg) {
		var self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		self.msg = msg;
		self.state = 2;
		if (self.chain.length > 0) {
			schedule(notify,self);
		}
	}

	function iteratePromises(Constructor,arr,resolver,rejecter) {
		for (var idx=0; idx<arr.length; idx++) {
			(function IIFE(idx){
				Constructor.resolve(arr[idx])
				.then(
					function $resolver$(msg){
						resolver(idx,msg);
					},
					rejecter
				);
			})(idx);
		}
	}

	function MakeDefWrapper(self) {
		this.def = self;
		this.triggered = false;
	}

	function MakeDef(self) {
		this.promise = self;
		this.state = 0;
		this.triggered = false;
		this.chain = [];
		this.msg = void 0;
	}

	function Promise(executor) {
		if (typeof executor != "function") {
			throw TypeError("Not a function");
		}

		if (this.__NPO__ !== 0) {
			throw TypeError("Not a promise");
		}

		// instance shadowing the inherited "brand"
		// to signal an already "initialized" promise
		this.__NPO__ = 1;

		var def = new MakeDef(this);

		this["then"] = function then(success,failure) {
			var o = {
				success: typeof success == "function" ? success : true,
				failure: typeof failure == "function" ? failure : false
			};
			// Note: `then(..)` itself can be borrowed to be used against
			// a different promise constructor for making the chained promise,
			// by substituting a different `this` binding.
			o.promise = new this.constructor(function extractChain(resolve,reject) {
				if (typeof resolve != "function" || typeof reject != "function") {
					throw TypeError("Not a function");
				}

				o.resolve = resolve;
				o.reject = reject;
			});
			def.chain.push(o);

			if (def.state !== 0) {
				schedule(notify,def);
			}

			return o.promise;
		};
		this["catch"] = function $catch$(failure) {
			return this.then(void 0,failure);
		};

		try {
			executor.call(
				void 0,
				function publicResolve(msg){
					resolve.call(def,msg);
				},
				function publicReject(msg) {
					reject.call(def,msg);
				}
			);
		}
		catch (err) {
			reject.call(def,err);
		}
	}

	var PromisePrototype = builtInProp({},"constructor",Promise,
		/*configurable=*/false
	);

	builtInProp(
		Promise,"prototype",PromisePrototype,
		/*configurable=*/false
	);

	// built-in "brand" to signal an "uninitialized" promise
	builtInProp(PromisePrototype,"__NPO__",0,
		/*configurable=*/false
	);

	builtInProp(Promise,"resolve",function Promise$resolve(msg) {
		var Constructor = this;

		// spec mandated checks
		// note: best "isPromise" check that's practical for now
		if (msg && typeof msg == "object" && msg.__NPO__ === 1) {
			return msg;
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			resolve(msg);
		});
	});

	builtInProp(Promise,"reject",function Promise$reject(msg) {
		return new this(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			reject(msg);
		});
	});

	builtInProp(Promise,"all",function Promise$all(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}
		if (arr.length === 0) {
			return Constructor.resolve([]);
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			var len = arr.length, msgs = Array(len), count = 0;

			iteratePromises(Constructor,arr,function resolver(idx,msg) {
				msgs[idx] = msg;
				if (++count === len) {
					resolve(msgs);
				}
			},reject);
		});
	});

	builtInProp(Promise,"race",function Promise$race(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			iteratePromises(Constructor,arr,function resolver(idx,msg){
				resolve(msg);
			},reject);
		});
	});

	return Promise;
});

// ## UTILS.JS

// **The Utils module provide a set of utility methods used
// across the whole library. For that, it doesn't have any
// dependency.**

define('utils',['npo'], function (Promise) {
  

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
    },

    // Get current position using HTML5 Geolocation and resolve promise
    // once it has returned.
    getCurrentPosition: function(options){
      if (typeof window !== 'undefined' && window.navigator.geolocation) {

        // Have default options, but allow to extend with custom.
        var geolocationOptions = this.extend({
          maximumAge: 0,
          timeout: 10000,
          enableHighAccuracy: true
        }, options);

        return new Promise(function (resolve, reject) {

          window.navigator.geolocation.getCurrentPosition(function (position) {

            resolve(position);

          }, function (err) {

            var errorMessage = 'Geolocation: ';
            if(err.code === 1) {
              errorMessage = 'You didn\'t share your location.';
            } else if(err.code === 2) {
              errorMessage = 'Couldn\'t detect your current location.';
            } else if(err.code === 3) {
              errorMessage = 'Retrieving position timed out.';
            } else {
              errorMessage = 'Unknown error.';
            }
            reject(errorMessage);

          }, geolocationOptions);

        });

      }else{
        return new Promise(function (resolve, reject) {
          reject('Your browser\/environment doesn\'t support geolocation.');
        });
      }
    }

  };

});
// ## CORE.JS

// **The Core module specifies the core EVT module and the client
// default settings. The library is built by adding functionality or
// sub-modules to EVT.**

define('core',[
  'utils'
], function (Utils) {
  

  // Version is udpated from package.json using `grunt-version` on build.
  var version = '2.0.5';


  // Setup default settings:

  // - ***apiUrl**: String - change the default API host*
  // - ***async**: Boolean - set to false to make synchronous requests (blocks UI)*
  // - ***fullResponse**: Boolean - by default the response of every call if the JSON
  // body. However if you need to access the 'status' or 'responseHeaders' in responses
  // set this to 'true'. The full response has the structure:*

  // ```
  //  {
  //    data: <JSON data>,
  //    headers: <response headers map>
  //    status: <HTTP status code>
  //  }
  // ```

  // - ***geolocation**: Boolean - set to true to ask for Geolocation when needed*
  // - ***fetchCascade**: Boolean - set to true to automagically fetch nested entities
  // (e.g. thng.product is an EVT.Product instead of string id)*
  // - ***onStartRequest**: Function - run before each HTTP call (e.g. start Spinner)*
  // - ***onFinishRequest**: Function - run after each HTTP call*
  var defaultSettings = {
    apiUrl: 'https://api.evrythng.com',
    async: true,
    fullResponse: false,
    geolocation: true
    /*fetchCascade: false,
    onStartRequest: null,
    onFinishRequest: null*/
  };


  // Module definition and raw API.
  var EVT = {
    version: version,

    settings: defaultSettings,

    // Setup method allows the developer to change overall settings for every
    // subsequent request. However, these can be overriden for each request as well.
    // Setup merges current settings with the new custom ones.
    setup: function (customSettings) {

      if(Utils.isObject(customSettings)){
        this.settings = Utils.extend(this.settings, customSettings);
      }else{
        throw new TypeError('Setup should be called with an options object.');
      }

      return this.settings;
    }
  };

  return EVT;

});

// ## SCOPE.JS

// **Scope defines the context in which API calls are made.
// Thus, it stores its defining API Key. Scopes send their
// respective `API Key` in their request's `Authorization` header.**

// *For example, reads on products using ApplicationScope or
// EVT.App only return the products created for that specific
// application/scope.*

define('scope/scope',[
  'utils'
], function (Utils) {
  

  // Scope super class constructor:

  // - ***new Scope(apiKey)** - API Key string*
  var Scope = function(apiKey){

    // Default parent scope does not have parent.
    this.parentScope = null;

    // Setup apiKey of the current Scope if it is a String.
    if(Utils.isString(apiKey)){
      this.apiKey = apiKey;
    }else{
      throw new TypeError('Scope constructor should be called with API Key.');
    }
  };

  // Return Scope factory function
  return Scope;

});

// ## LOGGER.JS

// **The Logger module is simple wrapper for console log
// that prefixes EvrythngJS's logs with a custom header.**

define('logger',[],function () {
  

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
// ## CORS.JS

// **The Cors module implements a simple CORS request using *XmlHttpRequest*.
// For browsers that don't properly support CORS (XHR2) we use JSON-P
// instead.**

// **In Node.js the *XmlHttpRequest* is proxied using the `w3c-xmlhttprequest`
// dependency, which is installed when installing EvrythngJS NPM package.**

// *This implementation is based on Nicholas Zakas' in
// [html5rocks](http://www.html5rocks.com/en/tutorials/cors/).*

define('ajax/cors',[
  'core',
  'npo',
  'utils',
  'logger'
], function (EVT, Promise, Utils, Logger) {
  

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

// ## CORS.JS

// **The Jsonp module implements a simple JSON-P fetcher. JSON-P is
// deprecated until IE<10 cease to exist and only works in browsers.**

// *This implementation is based on
// [Lightweight-JSONP](https://github.com/IntoMethod/Lightweight-JSONP).*

define('ajax/jsonp',[
  'core',
  'npo',
  'utils',
  'logger'
], function (EVT, Promise, Utils, Logger) {
  

  // Counter defines uniquely identified callbacks.
  var counter = 0, head;

  // Helper method that builds a custom Error object providing some extra
  // information on a request error.
  function _buildError(url, status, method, response){
    var errorData = {
      status: status,
      type: 'jsonp',
      message: 'Server responded with an error for the JSONP request',
      url: url,
      method: method
    };

    if(response) { errorData.errors = response.errors; }

    return errorData;
  }

  // Making the request is as simple as appending a new script tag
  // to the document. The URL has the *callback* parameter with the
  // function that will be called with the repsonse data and *async* flag
  // tells if the request should be synchronous and block the UI or not.
  function _load(url, async) {

    var script = document.createElement('script'),
      done = false;
    script.src = url;
    script.async = async;

    // Once the script has been loaded remove the tag from the document.
    script.onload = script.onreadystatechange = function() {
      if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
        done = true;
        script.onload = script.onreadystatechange = null;
        if ( script && script.parentNode ) {
          script.parentNode.removeChild( script );
        }
      }
    };

    if ( !head ) {
      head = document.getElementsByTagName('head')[0];
    }

    // Actually load script.
    head.appendChild( script );
  }


  // Jsonp method sets prepares the script url with all the information
  // provided and defines the callback handler.
  function jsonp(options, successCallback, errorCallback) {
    /*jshint camelcase:false */

    options = options || {};

    // Evrythng REST API default endpoint does not provide JSON-P
    // support, which '//js-api.evrythng.com' does.
    if(options.url) {
      options.url = options.url.replace('//api', '//js-api');
    }

    // Define unique callback name.
    var uniqueName = 'callback_json' + (++counter);


    // Send all data (including method, api key and data) via GET
    // request params.
    var params = options.params || {};
    params.callback = uniqueName;
    params.access_token = options.authorization;
    params.method = options.method || 'get';
    params.data = JSON.stringify(options.data);
    options.params = params;

    var async = options.async !== undefined ? options.async : true,
      url = Utils.buildUrl(options);


    // Return a promise and resolve/reject it in the callback function.
    return new Promise(function(resolve, reject) {

      // Attach callback as a global method. Evrythng's REST API error
      // responses always have a status and array of errors.
      window[uniqueName] = function(response){

        if (response.errors && response.status) {

          var errorData = _buildError(url, response.status, params.method, response);
          Logger.error(errorData);

          if(errorCallback) { errorCallback(errorData); }
          reject(errorData);

        }else {

          if(successCallback) { successCallback(response); }
          resolve(response);

        }

        // Remove callback from window.
        try {
          delete window[uniqueName];
        } catch (e) {}
        window[uniqueName] = null;
      };

      _load(url, async, reject);

    });
  }

  return jsonp;

});

// ## AJAX.JS

// **The Ajax module attaches the api() method to the EVT module.
// It controls the raw request to the API, first by trying a CORS
// request and if it fails, continuing with JSON-P.**

define('ajax',[
  'core',
  'ajax/cors',
  'ajax/jsonp',
  'utils',
  'logger'
], function (EVT, cors, jsonp, Utils, Logger) {
  

  // The ajax() method or EVT.api() returns a **Promise**. Nevertheless,
  // it still allows the old-styled callback API as follows:

  // - ***EVT.api(options)** - options object can contain `success` or `error`
  // properties to define success and error callbacks*
  // - ***EVT.api(options, successCb, errorCb)***

  // Options available are:

  // ```
  // fullResponse - override fullResponse global setting (see module `core`)
  // async - override async global setting (see module `core`)
  // url - URL of the request, relative to `EVT.settings.apiUrl`
  // method - HTTP method, default: `GET`
  // authorization - Authorization header content, should contain API Key
  // success - success handler function
  // error - error handler function
  // ```
  function ajax(options, successCallback, errorCallback) {

    // Merge options with defaults setup in `EVT.settings`.
    var requestOptions = Utils.extend({
      async: EVT.settings.async,
      fullResponse: EVT.settings.fullResponse,
      authorization: EVT.settings.apiKey
    }, options);

    requestOptions.url = EVT.settings.apiUrl + requestOptions.url;


    // Setup callbacks giving priority to parameters.
    var successCb, errorCb;

    if(Utils.isFunction(successCallback)){
      successCb = successCallback;
    }else if(Utils.isFunction(options.success)){
      successCb = options.success;
    }

    if(Utils.isFunction(errorCallback)){
      errorCb = errorCallback;
    }else if(Utils.isFunction(options.error)){
      errorCb = options.error;
    }


    // Returns a promise or immediate response if async = false.
    // Try to use XmlHttpRequest with CORS and fallback to JSON-P.
    try {

      return cors(requestOptions, successCb, errorCb);

    }catch(ex){

      // Re-throw error, if it is not a CORS problem.
      if(ex.name !== 'CorsError') { throw ex; }

      Logger.info('CORS not supported. Continuing with JSONP...');
      return jsonp(requestOptions, successCb, errorCb);
    }
  }

  // Attach ajax method to the EVT module.
  EVT.api = ajax;

  return EVT;

});

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

define('resource',[
  'core',
  'scope/scope',
  'utils',
  'logger',
  'ajax'
], function (EVT, Scope, Utils, Logger) {
  

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
// ## ENTITY.JS

// **Entity is a private super class that implements base common methods for
// all Evrythng objects. It establishes the way objects are converted
// to JSON, and provide an *update()* and *delete()* method for all entities.**

define('entity/entity',[
  'resource',
  'utils'
], function (Resource, Utils) {
  

  // The entity constructor, and therefore all the standard inheritances,
  // accepts:

  // - ***new Entity()**: create an empty entity*
  // - ***new Entity(obj)**: entity with merged obj properties*
  // - ***new Entity(resource)**: empty entity bound to a Resource*
  // - ***new Entity(obj, resource)**: fully build entity bound to a Resource*

  // *Nevertheless, an Entity without Resource cannot request any
  // update or delete. It can however be passed to resources as
  // 'payload' instead of JSON.*

  // ```js
  //  var prod = new EVT.Product({ foo: 'bar' };
  //  // prod.update() // throws error
  //  app.product().create(prod); // create product
  // ```

  var Entity = function (objData, resource) {

    if(Utils.isObject(objData)){

      if(objData instanceof Resource){
        this.resource = objData;
      } else {
        this.resource = resource;
        Utils.extend(this, objData, true);
      }

    }
  };

  // Return the JSON object that is stored in engine. All non-function properties
  // except *resource* are properties of the object.
  Entity.prototype.toJSON = function () {
    var json = {};

    for(var prop in this){
      if(this[prop] && !Utils.isFunction(this[prop]) && prop != 'resource'){
        json[prop] = this[prop];
      }
    }

    return json;
  };

  // Every entity can update itself via its resource reference. It does so by
  // passing its JSON representation to the *resouce.update()*.

  // An entity update, as every request, returns a Promise. Although it also
  // allows callbacks as:

  // - ***update()**: simple update itself with modified properties*
  // - ***update(obj)**: update itself with new properties*
  // - ***update(obj, successCb, errorCb)**: previous, with callbacks*
  // - ***update(successCb, errorCb)**: update itself and use callbacks*
  Entity.prototype.update = function (obj) {
    if(this.resource){

      var args = arguments, $this = this;

      // No object is passed, shift arguments. Add its JSON representation
      // as the first argument.
      if(obj === null || !obj || Utils.isFunction(obj)) {
        args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.toJSON());
      }

      return this.resource.update.apply(this.resource, args)
        .then(function (updated) {

          // Update itself with the result and return raw response from API.
          Utils.extend($this, updated, true);
          return updated;

        });

    } else {
      throw new Error('This entity has no resource');
    }
  };


  // Delete method also accepts callbacks as:

  // - ***delete()**: handle with promise*
  // - ***delete(successCb, errorCb)**: handle with callbacks*
  Entity.prototype['delete'] = function () {
    if(this.resource) {
      return this.resource['delete'].apply(this.resource, arguments);
    } else {
      throw new Error('This entity has no resource');
    }
  };


  return Entity;

});
// ## PROPERTY.JS

// **Property is a common Entity for Thngs and Products. It is always a
// nested resource and allows some simplified parameters, easing the
// update of properties and making it more fluent/literal.**

define('entity/property',[
  'core',
  './entity',
  'resource',
  'utils'
], function (EVT, Entity, Resource, Utils) {
  

  // Setup Property inheritance from Entity.
  var Property = function () {
    Entity.apply(this, arguments);
  };

  Property.prototype = Object.create(Entity.prototype);
  Property.prototype.constructor = Property;


  // The property update normalization of arguments allows to
  // make easier and more intuitive calls, such as:

  // - Single property update:

  // ```
  //  thng.property('status').update('off');
  //  thng.property('status').update({
  //    value: 'off'
  //  });
  // ```

  // - Multi property update:

  // ```
  //  thng.property().update({
  //    status: 'off',
  //    level: '80'
  //  });
  // ```
  function _normalizeArguments(args) {
    var data = args[0];

    if(Utils.isString(data)){

      // Update single property using string.
      args[0] = [{
        value: data
      }];

    }else if(Utils.isObject(data)) {

      if (data.value) {

        // Update single property using object notation.
        args[0] = [data];

      } else {

        // Update multiple properties, creating an object for
        // each key-value pair.
        args[0] = [];
        for (var key in data) {
          args[0].push({
            key: key,
            value: data[key]
          });
        }
      }
    }

    return args;
  }


  // Attach class to EVT module.
  EVT.Property = Property;


  return {

    resourceConstructor: function (property) {

      if(!this.resource) {
        throw new Error('This Entity does not have a Resource.');
      }

      var path = this.resource.path + '/properties',
        resource;

      if(property){
        if(Utils.isString(property)){
          path += '/' + property;
        }else{
          throw new TypeError('Property must be a key/name string');
        }
      }

      resource = new Resource(this.resource.scope, path, EVT.Property);

      // Override property resource update to allow custom values params.
      // See *_normalizeArguments()*.
      resource.update = function () {
        return Resource.prototype.update.apply(this, _normalizeArguments(arguments));
      };

      return resource;
    }

  };
});
// ## ACTION.JS

// **The Action Entity represents an action in the Engine. It inherits
// from Entity and overload the resource's *create()* method to allow
// empty parameters (no payload).**

define('entity/action',[
  'core',
  './entity',
  'scope/scope',
  'resource',
  'utils',
  'logger'
], function (EVT, Entity, Scope, Resource, Utils, Logger) {
  

  // Setup Action inheritance from Entity.
  var Action = function () {
    Entity.apply(this, arguments);
  };

  Action.prototype = Object.create(Entity.prototype);
  Action.prototype.constructor = Action;


  // If the action object is empty (or a callback), generate the
  // simplest action object that just needs the type of the action,
  // which can be obtained from the resource's path.
  function _normalizeArguments(obj) {
    var args = arguments;

    if(!obj || Utils.isFunction(obj)) {
      args = Array.prototype.slice.call(arguments, 0);
      args.unshift({});
    }

    return args;
  }

  // Add the given entity identifier to an object (params or data).
  function _addEntityIdentifier(entity, obj) {
    if(entity.constructor === EVT.Product){
      obj.product = entity.id;
    }else if(entity.constructor === EVT.Thng){
      obj.thng = entity.id;
    }

    return obj;
  }

  // Set the Entity ID of the entity receiving the action as well
  // as the specified action type in the action data.
  function _fillAction(entity, actionObj, actionType) {

    if(!(entity instanceof Scope) && !entity.id){
      throw new Error('This entity does not have an ID.');
    }

    var ret = actionObj;
    ret.type = actionType;

    _addEntityIdentifier(entity, ret);

    return ret;
  }


  // Attach class to EVT module.
  EVT.Action = Action;


  // Return the resource factory function. Actions have a custom *resource
  // constructor* that needs an action type and allows an optional ID.

  // - ***product.action('scans')**: creates path '/actions/scans'*
  // - ***product.action('scans', '1')**: creates path '/actions/scans/1'*
  return {

    resourceConstructor: function (actionType, id) {
      var path, resource,
        context = this,
        scope = this instanceof Scope? this : this.resource.scope;

      if(actionType){
        if(Utils.isString(actionType)){
          path = '/actions/' + actionType;
        }else{
          throw new TypeError('Action type must be a name string');
        }
      }else{
        throw new TypeError('Action type cannot be empty.');
      }

      // Create a resource constructor dynamically and call it with this
      // action's ID.
      resource = Resource.constructorFactory(path, EVT.Action).call(scope, id);

      // Overload Action resource *create()* method to allow empty object.
      resource.create = function () {

        var $this = this,
          args = _normalizeArguments.apply(this, arguments);

        args[0] = _fillAction(context, args[0], actionType);

        // If geolocation setting is turned on, get current position before
        // registering the action in the Engine.
        if(EVT.settings.geolocation){

          return Utils.getCurrentPosition().then(function (position) {

            args[0].location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            args[0].locationSource = 'sensor';

            return Resource.prototype.create.apply($this, args);

          }, function (err) {

            // Unable to get position, just inform the reason in the console.
            Logger.info(err);

            return Resource.prototype.create.apply($this, args);

          });

        }else{
          return Resource.prototype.create.apply($this, args);
        }
      };


      // Overload Action resource *read()* method to send entity identifier in
      // the params and fetch actions related to this entity.
      resource.read = function () {

        // Create params if they are not defined yet.
        var args = _normalizeArguments.apply(this, arguments);
        args[0].params = args[0].params || {};

        // Add the current entity identifier to the params
        _addEntityIdentifier(context, args[0].params);

        return Resource.prototype.read.apply(this, args);
      };

      return resource;
    }

  };
});
// ## PRODUCT.JS

// **The Product is a simple Entity subclass that provides a nested
// Property Resource.**

define('entity/product',[
  'core',
  './entity',
  'resource',
  './property',
  './action',
  'utils'
], function (EVT, Entity, Resource, Property, Action, Utils) {
  

  // Setup Product inheritance from Entity.
  var Product = function () {
    Entity.apply(this, arguments);
  };

  Product.prototype = Object.create(Entity.prototype);
  Product.prototype.constructor = Product;


  // Extend Product API by exposing a Property Resource, allowing to
  // manage the properties of this product with a resource pattern.
  // Expose an Action resource as well, for managing Products actions.
  Utils.extend(Product.prototype, {

    property: Property.resourceConstructor,

    action: Action.resourceConstructor
  
  }, true);


  // Attach class to EVT module.
  EVT.Product = Product;


  return {
    resourceConstructor: Resource.constructorFactory('/products', EVT.Product)
  };
});
// ## APPUSER.JS

// **The App User entity represents the app users stored in the Engine.
// It inherits from Entity and adds a new resource's *validate()* method,
// as well as a *self.validate()* to allow to validate users.**

define('entity/appUser',[
  'core',
  './entity',
  'resource',
  'utils',
  'ajax'
], function (EVT, Entity, Resource, Utils) {
  

  // Setup AppUser inheritance from Entity.
  var AppUser = function (objData) {

    // Rename user object argument's *evrythngUser* property to
    // entity-standard-*id*.
    if(objData.evrythngUser){
      objData.id = objData.evrythngUser;
      delete objData.evrythngUser;
    }

    Entity.apply(this, arguments);
  };

  AppUser.prototype = Object.create(Entity.prototype);
  AppUser.prototype.constructor = AppUser;

  // The validate method sends a `POST` request to the validate
  // endpoint of a new user. This is only valid when the AppUser
  // resource path is *'/auth/evrythng/users/1'*.
  function validate(activationCode) {

    if(!activationCode || !Utils.isString(activationCode)) {
      throw new Error('Activation code must be a string.');
    }

    var scope = this.scope, path = this.path;

    // If validate is called from the entity, the scope is the
    // resource's scope
    if(this.id){
      scope = this.resource.scope;
      path = this.resource.path + '/' + this.id;
    }

    // Activate newly created user.
    return EVT.api({
      url: path + '/validate',
      method: 'post',
      authorization: scope.apiKey,
      data: {
        activationCode: activationCode
      }
    });
  }


  // Extend AppUser API to allow to validate itself.
  Utils.extend(AppUser.prototype, {

    validate: function () {
      return validate.call(this, this.activationCode);
    }

  }, true);


  // Attach class to EVT module.
  EVT.AppUser = AppUser;


  // The AppUser resource constructor is a custom constructor that
  // returns the constructor. This allows the path to be variable.

  // *In practice '/users' and '/auth/evrythng/users' return the same
  // entity structure.*
  return {

    resourceConstructor: function (customPath) {

      var path = customPath || '/users';

      // Return the factory function.
      return function (id) {

        var resource = Resource.constructorFactory(path, EVT.AppUser).call(this, id);

        // Add *validate()* method to the resource as well
        resource.validate = function () {
          return validate.apply(this, arguments);
        };

        return resource;
      };
    }

  };
});
// ## FACEBOOK.JS

// **The Facebook module exports wrapped *login*, *logout* and *init* methods
// from the Facebook SDK, always returning Promises.**

define('social/facebook',[
  'npo',
  'utils'
], function (Promise, Utils) {
  
  /*global FB*/

  // Load Facebook SDK asynchronously. This means that by default
  // it is not bundled with EvrythngJS, and is only loaded if an application
  // needs Facebook authentication.

  // The *init()* method also gets the current user information in one
  // is already logged in.
  function init(appId) {

    // Return promise and resolve once user status is retrieved.
    return new Promise(function(resolve){

      // Notice that the FB SDK only works in the browser. Thus, an Evrtyhng
      // application cannot use Facebook authentication if it is not intended
      // to run in the browser, as well.
      window.fbAsyncInit = function () {

        FB.init({
          appId: appId,
          version: 'v2.0'
        });

        // Get Login status and user info if connected. Build response as we
        // fetch more information.
        FB.getLoginStatus(function (response) {

          /*response = authResponse + status*/
          _getUser(response).then(function(userResponse){

            /*userResponse = authResponse + status + user*/
            resolve(userResponse);

          });

        });
      };

      // Inject Facebook SDK script in document (see
      // [Facebook Developer Docs](https://developers.facebook.com/docs/javascript/quickstart/v2.0)).
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));

    });
  }

  // Invoke standard Facebook login popup, using specified options.
  function login(options) {

    // Return promise and resolve once user info is retrieved.
    return new Promise(function (resolve, reject) {

      FB.login(function (response) {

        /*response = authResponse + status*/
        _getUser(response).then(function (userResponse) {

          if(userResponse.user) {

            /*userResponse = authResponse + status + user*/
            resolve(userResponse);

          } else {

            // Reject login promise if the user canceled the FB login.
            reject(userResponse);

          }

        });

      }, options);

    });
  }

  // Invoke Facebook's logout and return promise.
  function logout() {

    return new Promise(function (resolve) {
      FB.logout(resolve);
    });
  }

  // Fetch user info from Facebook if user is successfully connected.
  function _getUser(response) {

    if(response.status == 'connected') {

      // Return a Promise for the response with user details.
      return new Promise(function (resolve) {

        // Until here, `response` was FB's auth response. Here
        // we start to build bigger response by appending the Facebook's
        // user info in the `user` property.
        FB.api('/me', function (userInfo) {
          resolve(Utils.extend(response, { user: userInfo }));
        });

      });

    }else{

      // Return an already resolved promise.
      return new Promise(function (resolve) {
        resolve(response);
      });

    }

  }

  // Expose only the higher level methods.
  return {
    init: init,
    login: login,
    logout: logout
  };

});
// ## AUTHENTICATION.JS

// **Authentication provides a complete abstraction layer on top of
// the provided *'/auth/...'* endpoints in the REST API. Logging in with
// Evrythng or Facebook uses the same method and provide a similar response.**

// **Authentication with Facebook needs an app that has been created using the
// `facebook: true` option, which will load and init the Facebook SDK.**

define('authentication',[
  'core',
  'npo',
  'social/facebook',
  'utils',
  'ajax'
], function (EVT, Promise, Facebook, Utils) {
  

  // Login into Evryhtng. This method is attached to the `EVT.App` API methods.
  // Currently allowed authentication methods are **evrythng** and **facebook**.
  // The login  accepts:

  // - ***login('facebook')**: the normal third-party Facebook login pop-up*
  // - ***login('facebook', fbOptions)**: use fbOptions to pass facebook scope
  // permissions (see the
  // [Facebook login API reference](https://developers.facebook.com/docs/reference/javascript/FB.login/v2.0)).*
  // - ***login('facebook', fbOptions, successCb, errorCb)**: same as previous,
  // with callbacks*
  // - ***login('facebook', successCb, errorCb**: no custom Facebook options*
  // - ***login('evrythng', evtCredentials)**: evtCredentials is an object with
  // `email` or `id` and `password` properties*
  // - ***login('evrythng', evtCredentials, successCb, errorCb)**: same as previous,
  // with callbacks*

  // The *evrythng* login methods allow to omit the first parameter. Thus, the
  // following authenticates with Evrythng:

  // ```
  //  app.login({
  //    email/id: "userEmailOrId",
  //    password: "pass"
  //  });
  // ```

  function login(type, customOptions, successCallback, errorCallback) {
    var successCb = successCallback,
      errorCb = errorCallback;

    if(!type){
      throw new TypeError('Credentials (for Evrythng) or type (for Third party) are missing.');
    }

    // Authenticate using third parties' OAuth.
    if(Utils.isString(type)){

      if(type === 'facebook'){
        return _loginFacebook.call(this, customOptions, successCb, errorCb);

      }else if(type === 'evrythng') {
        return _loginEvrythng.call(this, customOptions, successCb, errorCb);
      }

      /*TODO: add more authentication methods here.*/

    }else{

      // Evrythng login does not need first param. Simply call *_loginEvrythng()*
      // with shifted arguments.
      return _loginEvrythng.call(this, type, customOptions, successCb);

    }
  }


  // Login with Facebook. Custom Options are optional.

  // **Default Facebook scope permission is simply *'email'*. If your application
  // needs more than that, please read about Facebook login options and permissions
  // on their
  // [Developer Docs](https://developers.facebook.com/docs/reference/javascript/FB.login/v2.0)**.
  function _loginFacebook(customOptions, successCallback, errorCallback) {
    var options = {scope: 'email'},
      $this = this;

    // If there are no facebook custom options, callbacks can start in first param.
    if(Utils.isFunction(customOptions) || customOptions === null){

      var tmp = successCallback;
      successCallback = customOptions;
      errorCallback = tmp;

    }else if(Utils.isObject(customOptions)){

      // If there are custom FB options, use this instead of the defaults.
      options = customOptions;

    }

    // Return promise and resolve only once authenticated with EVRYTHNG.
    return new Promise(function(resolve, reject) {

      // Login using Facebook with options above.
      Facebook.login(options).then(function (userResponse) {

        // If successful, authenticate with Evrythng, apply *successCb* and resolve
        // promise. Our own *Facebook.login()* method (defined in the [`social/facebook`
        // module](social/facebook.html)) already resolves with the user information.
        // In this case, we add Evrythng access data to this already wrapped response.
        authFacebook.call($this, userResponse).then(function (fullResponse) {

          if (successCallback) { successCallback(fullResponse);}
          resolve(fullResponse);

        });

      }, function (response) {

        // Login was not successful, apply *errorCb* and reject promise. Response
        // has Facebook's *authResponse* and *status* objects.
        if (errorCallback) { errorCallback(response); }
        reject(response);

      });

    });
  }


  // Login with Evrythng using either the *email* or *id* properties.
  function _loginEvrythng(credentials, successCallback, errorCallback) {

    if(!credentials || Utils.isFunction(credentials)) {
      throw new TypeError('Credentials are missing.');
    }

    // Send the authentication request to the REST API, which is a Promise.
    // Note that the context is passed from the above *app.login()* method
    // until the raw call in order to pass the correct scope's Api Key.
    return _authEvrythng.call(this, credentials).then(function (userResponse) {

      // Login was successful, apply callback and propagate response to the
      // next promise handler.
      if(successCallback) { successCallback(userResponse); }
      return userResponse;

    }, function (response) {

      // Login was not successful, call error callback and re-throw error.
      if(errorCallback) { errorCallback(response); }
      throw response;

    });
  }

  // Send authentication request with the Facebook auth token. This method is
  // used on explicit login and when Facebook is initialized in the `EVT.App`
  // constructor.
  function authFacebook(response) {
    var $this = this;

    return EVT.api({
      url: '/auth/facebook',
      method: 'post',
      data: {
        access: {
          token: response.authResponse.accessToken
        }
      },
      authorization: this.apiKey
    }).then(function (access) {

      // Create User Scope with the user information and Api Key returned
      // from the REST API.
      var user = new EVT.User({
        id: access.evrythngUser,
        apiKey: access.evrythngApiKey
      }, $this);

      // Prepare resolve object. Move Facebook user data to
      // 'user.facebook' object
      Utils.extend(user, { facebook: response.user }, true);
      response.user = user;

      return response;

    });
  }

  // Send authentication request using Evrythng credentials.
  function _authEvrythng(credentials) {
    var $this = this;

    return EVT.api({
      url: '/auth/evrythng',
      method: 'post',
      data: credentials,
      authorization: this.apiKey
    }).then(function (access) {

      // Once it is authenticated, get this user information as well.
      return EVT.api({
        url: '/users/' + access.evrythngUser,
        authorization: access.evrythngApiKey
      }).then(function (userInfo) {

        // Keep nested success handler because we also need the *access*
        // object returned form the previous call to create the User Scope.
        var userObj = Utils.extend(userInfo, {
          id: access.evrythngUser,
          apiKey: access.evrythngApiKey
        });

        // Create User Scope
        var user = new EVT.User(userObj, $this);

        return { user: user };

      });

    });
  }


  // The *logout()* method behaves similarly to *login()*. The user should
  // specify the type of logout they want (***evrythng* is default**).

  // If an application logs in with Facebook, and simply logs out of
  // Evrythng, then the Facebook user will continue connected until its FB
  // token expires (which is most of the times not what you want).

  // **As a good practice, if you log into an app with Facebook, also log
  // out with Facebook. This allows app users to switch Facebook accounts.**
  function logout(type, successCallback, errorCallback) {

    if(type && Utils.isString(type)){

      if(type === 'facebook') {
        return _logoutFacebook.call(this, successCallback, errorCallback);

      } else if(type === 'evrythng') {
        return _logoutEvrythng.call(this, successCallback, errorCallback);
      }

    }else{
      return _logoutEvrythng.call(this, type, successCallback);
    }

  }

  // Logging out with Facebook, logs out out from Facebook and also from
  // Evrythng.
  function _logoutFacebook(successCallback, errorCallback) {
    var $this = this;

    return Facebook.logout().then(function () {

      // If successful (always), also logout from Evrythng.
      return _logoutEvrythng.call($this, successCallback, errorCallback);

    });
  }


  function _logoutEvrythng(successCallback, errorCallback) {

    return EVT.api({
      url: '/auth/all/logout',
      method: 'post',
      authorization: this.apiKey

    }).then(function (response) {

      if(successCallback) { successCallback(response); }
      return response;

    }, function (err) {

      // If the logout from Evrythng fails, by some reason, throw error
      // which would go to the promise error handler of the caller.
      if(errorCallback) { errorCallback(err); }
      throw err;

    });
  }

  // Expose only the higher level methods.
  return {
    login: login,
    logout: logout,
    authFacebook: authFacebook
  };

});
// ## APPLICATION.JS

// **Here it is defined the ApplicationScope or `EVT.App`. EVT.App
// is a sub-class of scope and it defines the public API that an App Api Key
// can access to.**

// An Application scope currently has access to:

// - Product resource (`R`)
// - Action resource (`C`) - Scans only
// - App User resource (`C`)
// - Login
// - (`C` actions via products)

define('scope/application',[
  'core',
  './scope',
  'resource',
  'entity/product',
  'entity/action',
  'entity/appUser',
  'authentication',
  'social/facebook',
  'utils',
  'logger',
  'ajax'
], function (EVT, Scope, Resource, Product, Action, AppUser,
             Authentication, Facebook, Utils, Logger) {
  

  // Application Scope constructor. It can be called with the parameters:

  // - ***new EVT.App(apiKey)** - API Key string*
  // - ***new EVT.App(options)** - Options object should contain `apiKey`,
  // and optionally `facebook` boolean. Passing `facebook: true` automatically
  // initializes Facebook SDK with this application's FB App Id - setup in
  // EVRYTHNG's Dashboard Project Preferences.*
  var ApplicationScope = function(obj){

    var $this = this;

    // Setup base Scope with the provided API Key.
    if(Utils.isObject(obj)){
      Scope.call(this, obj.apiKey);
    }else{
      Scope.call(this, obj);
    }

    // Get app information asynchronously from the Engine using already
    // defined scope. Use **new EVT.App('apiKey').$init.then(success)** if need
    // to wait for app information.
    this.$init = EVT.api({
      url: '/applications',
      authorization: this.apiKey
    }).then(function (apps) {

      // Apps return array of a single application that matches this
      // API Key. The response's API Key is defined in property `appApiKey`
      // instead of `apiKey`, so remove it to prevent redundant apiKey
      // properties in the scope. Also, attach app details into the scope.
      delete apps[0].appApiKey;
      return Utils.extend($this, apps[0], true);

    }, function () {
      Logger.error('There is no application with this API Key.');

    }).then(function (app) {

      // If using Facebook, the $init promise is only resolved after FB
      // is initialized and user login status is retrieved. In this situation,
      // the resolved object of `$init` is a wrapped object:

      // ```
      //  {
      //    status: <Facebook's connected status>,
      //    authResponse: <Facebook's auth response>,
      //    user: {
      //      facebook: { <Facebook's user info>}
      //      <Evrythng's user information>
      //    },
      //    app: {
      //      <Evrythng's app information>
      //    }
      //  }
      // ```
      if(obj.facebook){

        if(!app.socialNetworks || !app.socialNetworks.facebook){
          Logger.error('The Facebook configuration for this application is incorrect.');
          return;
        }

        // Get Facebook App ID from the Evrythng App social networks list.
        return Facebook.init(app.socialNetworks.facebook.appId)
          .then(function (response) {

            if(response.status === 'connected') {

              // If user is connected with Facebook, return a promise with his details.
              return Authentication.authFacebook.call($this, response);

            } else {
              return response;
            }

          }).then(function (response) {

            // Add app information to the already wrapped object.
            return Utils.extend(response, { app: app });

          });

      }else{

        // If not using Facebook, simply return app details after they are received.
        return app;
      }

    });
  };

  // Setup Scope inheritance.
  ApplicationScope.prototype = Object.create(Scope.prototype);
  ApplicationScope.prototype.constructor = ApplicationScope;


  // Implement Public API by extending the prototype.

  // By default all resource constructors are themselves factory functions
  // that are called by the scopes, can receive an ID and return a Resource.
  // However, in some situations in our API, the output of different endpoints can
  // return be the same. Thus we need to setup the resource constructor to use a certain
  // path, and return the correct factory function. This is what happens here with the
  // **appUser()** resource constructor.
  Utils.extend(ApplicationScope.prototype, {

    product: Product.resourceConstructor,

    action: Action.resourceConstructor,

    // Setup AppUser resource to use *'/auth/evrythng/users'* instead
    // of the default *'/users'*. Both endpoints return a list of User entities.
    appUser: AppUser.resourceConstructor('/auth/evrythng/users'),

    login: Authentication.login

  }, true);


  // Attach ApplicationScope class to the EVT module.
  EVT.App = ApplicationScope;

  return EVT;

});

// ## THNG.JS

// **The Thng is a simple Entity subclass that provides a nested
// Property Resource and a direct method to read the Thng's Product.**

define('entity/thng',[
  'core',
  './entity',
  'resource',
  './property',
  './action',
  'utils',
  'ajax'
], function (EVT, Entity, Resource, Property, Action, Utils) {
  

  // Setup Thng inheritance from Entity.
  var Thng = function () {
    Entity.apply(this, arguments);
  };

  Thng.prototype = Object.create(Entity.prototype);
  Thng.prototype.constructor = Thng;


  // When not using `fetchCascade`, this method allows to easily
  // fetch the Product entity of this Thng. It fowards the call
  // to this thng's scope's product resource.
  function readProduct() {

    if(!this.product) {
      throw new Error('Thng does not have a product.');
    }

    if(!this.resource) {
      throw new Error('Thng does not have a resource.');
    }

    return this.resource.scope.product(this.product).read();
  }


  // Extend Thng API by exposing a Property Resource, allowing to
  // manage the properties of this product with a resource pattern.
  // Expose an Action resource as well, for managing Thngs actions.
  // Also attach the *readProduct()* method to every Thng.
  Utils.extend(Thng.prototype, {

    property: Property.resourceConstructor,

    action: Action.resourceConstructor,

    readProduct: readProduct

  }, true);


  // Attach class to EVT module.
  EVT.Thng = Thng;


  return {
    resourceConstructor: Resource.constructorFactory('/thngs', EVT.Thng)
  };
});
// ## COLLECTION.JS

// **The Collection is a simple Entity subclass that provides a nested
// Thng Resource.**

define('entity/collection',[
  'core',
  './entity',
  'resource',
  'utils'
], function (EVT, Entity, Resource, Utils) {
  

  // Setup Collection inheritance from Entity.
  var Collection = function () {
    Entity.apply(this, arguments);
  };

  Collection.prototype = Object.create(Entity.prototype);
  Collection.prototype.constructor = Collection;


  // Custom nested resource constructor for Thngs of a Collection.
  // To create this nested resource, the collection itself needs
  // a resource.
  function collectionThng(id) {
    if(!this.resource) {
      throw new Error('This Entity does not have a Resource.');
    }

    var path = this.resource.path + '/thngs';

    return Resource.constructorFactory(path, EVT.Thng)
      .call(this.resource.scope, id);
  }


  // Extend Collection API by exposing a Thng Resource, allowing to
  // manage Thngs directly from a Collection.
  Utils.extend(Collection.prototype, {
    thng: collectionThng
  }, true);


  // Attach class to EVT module.
  EVT.Collection = Collection;


  return {
    resourceConstructor: Resource.constructorFactory('/collections', EVT.Collection)
  };
});
// ## MULTIMEDIA.JS

// **The Multimedia is a simple Entity subclass representing the REST API
// Multimedia Content object.**

define('entity/multimedia',[
  'core',
  './entity',
  'resource'
], function (EVT, Entity, Resource) {
  

  // Setup Multimedia inheritance from Entity.
  var Multimedia = function () {
    Entity.apply(this, arguments);
  };

  Multimedia.prototype = Object.create(Entity.prototype);
  Multimedia.prototype.constructor = Multimedia;


  // Attach class to EVT module.
  EVT.Multimedia = Multimedia;


  return {
    resourceConstructor: Resource.constructorFactory('/contents/multimedia', EVT.Multimedia)
  };
});
// ## USER.JS

// **Here it is defined the UserScope or `EVT.User`. EVT.User
// is a sub-class of scope and it defines the public API that the
// user and its API Keys can access to.**

// A User scope currently has access to:

// - Product resource (`C`, `R`, `U`)
// - Thng resource (`C`, `R`, `U`)
// - Action resource (`C`, `R`)
// - Collection resource (`C`, `R`, `U`)
// - Multimedia resource (`R`)
// - Logout
// - Search
// - Update itself (the user information)
// - (`C`, `R`, `U` actions via products/thngs)

define('scope/user',[
  'core',
  './scope',
  'entity/product',
  'entity/thng',
  'entity/appUser',
  'entity/action',
  'entity/collection',
  'entity/multimedia',
  'authentication',
  'utils'
], function (EVT, Scope, Product, Thng, AppUser, Action, Collection,
             Multimedia, Authentication, Utils) {
  

  // User Scope constructor. It can be called with the parameters:

  // - ***new EVT.User(apiKey, parentScope)** - API Key string.
  // Optional parent scope.*
  // - ***new EVT.User(options, parentScope)** - Options object should
  // contain `apiKey` and optionally user information (user entity retrieved
  // from the engine). Optional parent scope.*
  var UserScope = function(obj, parentScope){

    // Setup base Scope with the provided API Key.
    if(Utils.isObject(obj)){
      Scope.call(this, obj.apiKey);

      // Merge user information into the scope, as we do with the ApplicationScope.
      Utils.extend(this, obj, true);

    }else{
      Scope.call(this, obj);
    }

    // Store parent scope. *Currently not used.*
    if(parentScope instanceof Scope) {
      this.parentScope = parentScope;
    }

  };

  // Setup Scope inheritance.
  UserScope.prototype = Object.create(Scope.prototype);
  UserScope.prototype.constructor = UserScope;


  // Wrap the search API call in the search() method. Check the
  // [search API in Evrythng Documentation](https://dev.evrythng.com/documentation/api#search).
  // .search() allows the following parameters:

  // - ***search(queryString, options)** - ?q=queryString. Options object represent
  // the additional search parameters. Such as:*

  // ```
  //  {
  //    types: 'thng,product'
  //  }
  // ```

  // - ***search(queryObj, options)** - Apply field or geographic search. Such as:*

  // ```
  //  {
  //    name: 'tv',
  //    description: 'plasma'
  //  }
  // ```

  // ```
  //  {
  //    lat: 72,000
  //    long: -0,190
  //    maxDistance: 5
  //  }
  // ```

  // - ***search(queryOptions)** - Merge all search parameters in a single object*
  function search(query, options) {
    var params = {};

    // Use Free-text search using query string and additional parameters.
    if(Utils.isString(query)) {
      params.q = query;
      params = Utils.extend(params, options);

    } else {
      params = query;

      // Merge query and additional options in a single object for the request.
      if(options) {
        Utils.extend(params, options, true);
      }
    }

    return EVT.api({
      url: '/search',
      params: params,
      authorization: this.apiKey
    });
  }

  // Allow to update the current user without an explicit API call. Simply update
  // the user scope object and call update will make the request to update the user
  // in the *'/users'* endpoint.
  function update() {
    var $this = this,
      self = AppUser.resourceConstructor().call(this, this.id);

    return self.update(arguments).then(function (updated) {
      Utils.extend($this, updated, true);
      return updated;
    });
  }


  // Implement Public API by extending the prototype.

  // See explanation of resource constructors in ApplicationScope. The
  // **thng()** resource builds a custom resource constructor by using
  // the default *'/thngs'* endpoint.
  Utils.extend(UserScope.prototype, {

    product: Product.resourceConstructor,

    thng: Thng.resourceConstructor,

    action: Action.resourceConstructor,

    collection: Collection.resourceConstructor,

    multimedia: Multimedia.resourceConstructor,

    logout: Authentication.logout,

    search: search,

    update: update

  }, true);


  // Attach UserScope class to the EVT module.
  EVT.User = UserScope;

  return EVT;

});

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
// - [NPO](https://github.com/getify/native-promise-only): an ES6 Promise polyfill,
// strict Promises/A+ (1.1) implementation

// See the full [uncompressed library](https://github.com/evrythng/evrythng-js-sdk/tree/master/dist/evrythng.js) @ Github.

define('evrythng',[
  "scope/application",
  "scope/user"
], function(EVT) {
  

  // Return fully built EVT module.
  return EVT;

});

    //Use almond's special top-level, synchronous require to trigger factory
    //functions, get the final module value, and export it as the public
    //value.
    return require('evrythng');
}));
