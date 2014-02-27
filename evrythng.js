/*!
 * Client-side JavaScript library to access Evrythng API v1.1.1
 * https://github.com/evrythng/evrythng-java-sdk
 *
 * Copyright [2014] [EVRYTHNG Ltd. London / Zurich]
 *
 * Released under the http://www.apache.org/licenses/LICENSE-2.0
 * https://github.com/evrythng/evrythng-java-sdk/blob/master/LICENSE.txt
 *
 */

Evrythng = function(options) {
	this.options = {
		evrythngApiCorsUrl: 'https://api.evrythng.com',
		evrythngApiJsonpUrl: 'https://js-api.evrythng.com'
	};
	if (typeof options === 'object') {
		for (var i in options) {
			this.options[i] = options[i];
		}
	}
	if (this.options.evrythngApiUrl) {
		if (this.options.evrythngApiUrl.indexOf('//js-api') !== -1) {
			// backward compatibility
			this.options.evrythngApiJsonpUrl = this.options.evrythngApiUrl;
			this.options.evrythngApiCorsUrl = this.options.evrythngApiUrl.replace('//js-api', '//api');
		}
		else {
			// cors by default
			this.options.evrythngApiCorsUrl = this.options.evrythngApiUrl;
			this.options.evrythngApiJsonpUrl = this.options.evrythngApiUrl.replace('//api', '//js-api');
		}
	}
};


Evrythng.prototype.version = '1.1.1';

/*
 *  Search
 */
Evrythng.prototype.search = function(options, callback) {
	var self = this,
		params = (options.params) ? options.params : {};
		query = {
			url: '/search',
			params: params
	};
	if (self.options.evrythngAppId) query.params.app = self.options.evrythngAppId;
	return self.request(query, callback);
};

/*
	Checkin
*/
Evrythng.prototype.checkin = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: '/actions/checkins',
			data: {
				timestamp: new Date().getTime(),
				type: 'checkins',
				tags: options.tags,
				location: {
					latitude: options.defaultLocation ? options.defaultLocation.latitude : null,
					longitude: options.defaultLocation ? options.defaultLocation.longitude : null
				}
			},
			method: 'post',
			evrythngApiKey: options.evrythngApiKey
		},
		doCheckin = function() {
			if (typeof query.data.location.latitude === 'number' && typeof query.data.location.longitude === 'number') {
				query.data.locationSource = 'sensor';
			}
			self.request(query, function(response) {
				if (typeof self.options.loadingCallback === 'function') self.options.loadingCallback.call(self, false);
				if (typeof callback === 'function') {
					callback.call(self, response);
				}
			}, errorHandler);
		};
	// is it a product checkin or a thng checkin?
	if (options.thng) {
		query.data.thng = options.thng;
	}
	else if (options.product) {
		query.data.product = options.product;
	}
	if (options.createThng) {
		query.params.createThng = options.createThng;
	}
	if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, true);
	if (navigator.geolocation && !this.options.disableGeolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			query.data.location.latitude = position.coords.latitude;
			query.data.location.longitude = position.coords.longitude;
			doCheckin();
		}, function(error) {
			doCheckin();
		});
	}
	else {
		doCheckin();
	}
};


/*
	Scan
*/
Evrythng.prototype.scan = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: '/actions/scans',
			data: {
				thng: options.thng,
				timestamp: new Date().getTime(),
				type: 'scans',
				location: {
					latitude: options.defaultLocation ? options.defaultLocation.latitude : null,
					longitude: options.defaultLocation ? options.defaultLocation.longitude : null
				},
				locationSource: 'sensor',
				customFields: options.customFields
			},
			method: 'post',
			evrythngApiKey: options.evrythngApiKey
		},
		doScan = function() {
			self.request(query, function(response) {
				if (typeof self.options.loadingCallback === 'function') self.options.loadingCallback.call(self, false);
				if (typeof callback === 'function') {
					callback.call(self, response);
				}
			}, errorHandler);
		};
	if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, true);
	if (navigator.geolocation && !this.options.disableGeolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			query.data.location.latitude = position.coords.latitude;
			query.data.location.longitude = position.coords.longitude;
			doScan();
		}, function(error) {
			doScan();
		});
	}
	else {
		doScan();
	}
};


/*
	Share
*/
Evrythng.prototype.share = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: '/actions/shares',
			data: {
				type: 'shares',
				location: {
					latitude: options.defaultLocation ? options.defaultLocation.latitude : null,
					longitude: options.defaultLocation ? options.defaultLocation.longitude : null
				},
				locationSource: 'sensor'
			},
			method: 'post',
			evrythngApiKey: options.evrythngApiKey
		},
		doAction = function() {
			self.request(query, function(response) {
				if (typeof self.options.loadingCallback === 'function') self.options.loadingCallback.call(self, false);
				if (typeof callback === 'function') {
					callback.call(self, response);
				}
			}, errorHandler);
		};
	if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, true);
	if (navigator.geolocation && !this.options.disableGeolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			query.data.location.latitude = position.coords.latitude;
			query.data.location.longitude = position.coords.longitude;
			doAction();
		}, function(error) {
			doAction();
		});
	}
	else {
		doAction();
	}
};


/*
	Applications CRUD
*/
Evrythng.prototype.createApplication = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/applications'),
		method : 'post',
		data : options.data
	}, callback, errorHandler);
};


Evrythng.prototype.readApplication = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: options.application ? self.buildUrl('/applications/%s', options.application) : '/applications'
	}, callback, errorHandler);
};


Evrythng.prototype.updateApplication = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/applications/%s', options.application),
		method : 'put',
		data : options.data
	}, callback, errorHandler);
};


Evrythng.prototype.deleteApplication = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/applications/%s', options.application),
		method : 'delete'
	}, callback, errorHandler);
};


/*
	Products CRUD
*/
Evrythng.prototype.createProduct = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: '/products',
			method: 'post',
			data: options.data
		};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};


Evrythng.prototype.readProduct = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: options.product ? self.buildUrl('/products/%s', options.product) : '/products',
			params: options.params || {}
		};
	if (self.options.evrythngAppId) query.params.app = self.options.evrythngAppId;
	return self.request(query, callback, errorHandler);
};


Evrythng.prototype.updateProduct = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: self.buildUrl('/products/%s', options.product),
			method: 'put',
			data: options.data
		};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};


Evrythng.prototype.deleteProduct = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: self.buildUrl('/products/%s', options.product),
			method: 'delete'
		};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};

/*
 * Product Redirector CRUD
 */
Evrythng.prototype.createProductRedirector = function(options, callback, errorHandler) {
	var self = this;
	var query = {
		url: self.buildUrl('/products/%s/redirector', options.product),
		method: 'post',
		data: options.data
	};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};

Evrythng.prototype.readProductRedirector = function(options, callback, errorHandler) {
	var self = this;
	var query = {
		url: self.buildUrl('/products/%s/redirector', options.product),
		params : options.params
	};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};

Evrythng.prototype.updateProductRedirector = function(options, callback, errorHandler) {
	var self = this;
	var query = {
		url: self.buildUrl('/products/%s/redirector', options.product),
		method: 'put',
		data: options.data
	};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};

Evrythng.prototype.deleteProductRedirector = function(options, callback, errorHandler) {
	var self = this;
	var query = {
		url: self.buildUrl('/products/%s/redirector', options.product),
		method: 'delete',
	};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};

/*
	Thngs CRUD
*/
Evrythng.prototype.createThng = function(options, callback, errorHandler) {
	var self = this;
	var query = {
		url: self.buildUrl('/thngs'),
		method: 'post',
		data: options.data
	};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};


Evrythng.prototype.readThng = function(options, callback, errorHandler) {
	var self = this;
	var params = (options.params) ? options.params : {}; 
	if (self.options.evrythngAppId) params.app = self.options.evrythngAppId;

	return self.request({
		url: options.thng ? self.buildUrl('/thngs/%s', options.thng) : '/thngs',
		params: params
	}, callback, errorHandler);
};


Evrythng.prototype.updateThng = function(options, callback, errorHandler) {
	var self = this;
	var query = {
		url: self.buildUrl('/thngs/%s', options.thng),
		method: 'put',
		data: options.data
	};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};

	return self.request(query, callback, errorHandler);
};


Evrythng.prototype.deleteThng = function(options, callback, errorHandler) {
	var self = this;
	var query = {
		url: self.buildUrl('/thngs/%s', options.thng),
		method: 'delete'
	};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};

	return self.request(query, callback, errorHandler);
};


/*
	Thng Properties CRUD
*/
Evrythng.prototype.createProperty = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/properties', options.thng),
		method: 'post',
		data: options.data
	}, callback, errorHandler);
};


Evrythng.prototype.readProperty = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: options.property ? self.buildUrl('/thngs/%s/properties/%s', options.thng, options.property) : self.buildUrl('/thngs/%s/properties', options.thng)
	}, callback, errorHandler);
};


Evrythng.prototype.updateProperty = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/properties', options.thng),
		method: 'put',
		data: options.data
	}, callback, errorHandler);
};


Evrythng.prototype.deleteProperty = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/properties/%s', options.thng, options.property),
		method: 'delete'
	}, callback, errorHandler);
};


/*
	Thng Location RU
*/
Evrythng.prototype.readThngLocation = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/location', options.thng),
		params: options.params
	}, callback, errorHandler);
};


Evrythng.prototype.updateThngLocation = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/location', options.thng),
		data: options.data,
		method: 'put'
	}, callback, errorHandler);
};

/*
	Thng Redirector CRUD
 */
Evrythng.prototype.createThngRedirector = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/redirector', options.thng),
		method: 'post',
		data: options.data
	}, callback, errorHandler);
};

Evrythng.prototype.readThngRedirector = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/redirector', options.thng),
		params : options.params
	}, callback, errorHandler);
};

Evrythng.prototype.updateThngRedirector = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/redirector', options.thng),
		method: 'put',
		data: options.data
	}, callback, errorHandler);
};

Evrythng.prototype.deleteThngRedirector = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/thngs/%s/redirector', options.thng),
		method: 'delete',
	}, callback, errorHandler);
};

/*
	Analytics R
*/
Evrythng.prototype.readAnalytics = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/analytics/query/%s', options.kpi),
		params: options.params
	}, callback, errorHandler);
};


/*
	Users R
*/
Evrythng.prototype.readUser = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: options.user ? self.buildUrl('/users/%s', options.user) : '/users'
		};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};


/*
	Loyalty R
*/
Evrythng.prototype.readLoyaltyStatus = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/loyalty/%s/status', options.user)
	}, callback, errorHandler);
};


Evrythng.prototype.readLoyaltyTransactions = function(options, callback, errorHandler) {
	var self = this,
		query = {
			url: self.buildUrl('/loyalty/%s/transactions', options.user)
		};
	if (self.options.evrythngAppId) query.params = {app: self.options.evrythngAppId};
	return self.request(query, callback, errorHandler);
};


/*
	Actions R
*/
Evrythng.prototype.readActionTypes = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: '/actions'
	}, callback, errorHandler);
};


Evrythng.prototype.readAction = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: options.action ? self.buildUrl('/actions/' + options.type + '/%s', options.action) : self.buildUrl('/actions/%s', options.type),
		params: options.params
	}, callback, errorHandler);
};


/*
	Places R
*/
Evrythng.prototype.readPlaces = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url : self.buildUrl('/places'),
		params: options.params
	}, callback, errorHandler);
};


/*
	Multimedia CRD
*/
Evrythng.prototype.createMultimedia = function(options, callback, errorHandler) {
	var self = this,
	    query = {
    		url: '/contents/multimedia',
    		data: options.data,
    		method: 'post',
    		params: options.params || {},
    		evrythngApiKey: options.evrythngApiKey
    	};
	if (self.options.evrythngAppId) query.params.app = self.options.evrythngAppId;
	return self.request(query, callback, errorHandler);
};


Evrythng.prototype.readMultimedia = function(options, callback, errorHandler) {
	var self = this,
	    query = {
    		url: options.multimedia ? self.buildUrl('/contents/multimedia/%s', options.multimedia) : '/contents/multimedia',
    		params: options.params || {},
    		evrythngApiKey: options.evrythngApiKey
		};
	if (self.options.evrythngAppId) query.params.app = self.options.evrythngAppId;
	return self.request(query, callback, errorHandler);
};


Evrythng.prototype.deleteMultimedia = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: self.buildUrl('/contents/multimedia/%s', options.multimedia),
		method: 'delete',
   		params: options.params || {},
   		evrythngApiKey: options.evrythngApiKey
	}, callback, errorHandler);
};


/*
	Files R
*/
Evrythng.prototype.readFile = function(options, callback, errorHandler) {
	var self = this;
	return self.request({
		url: options.file ? self.buildUrl('/files/%s', options.file) : '/files'
	}, callback, errorHandler);
};


////////////////////////
////// UTILITIES ///////
////////////////////////

/*
	Facebook
*/
Evrythng.prototype.fbInit = function(callback) {
	var self = this,
		fbUrl = '//connect.facebook.net/en_US/all.js';
	this.options.loginCallback = callback;
	window.fbAsyncInit = function() {
		self.fbAsyncInit.call(self);
	};
	if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, true);
	load.js(fbUrl, function() {
		if (typeof FB != 'object') {
			if (typeof self.options.loadingCallback === 'function') self.options.loadingCallback.call(self, false);
			self.handleError({
				status: 0,
				type: 'facebook',
				message: 'It seems that Facebook is not available on your network. Please check your Internet connection',
				url: fbUrl,
				method: 'GET'
			});
		}
	});
};


Evrythng.prototype.fbAsyncInit = function() {
	var self = this,
		actionButton = self.options.actionButton ? document.getElementById(self.options.actionButton) : null;
	FB.init({appId: this.options.facebookAppId, status: true, cookie: true, xfbml: false, oauth: true});
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			if (actionButton) {
				actionButton.onclick = function() {
					self.fbCallback.call(self, response);
				};
			}
			if (self.options.forceLogin) self.fbCallback.call(self, response);
		}
		else {
			if (actionButton) {
				actionButton.onclick = function() {
					self.fbLogin.call(self, self.fbCallback);
				};
			}
			if (self.options.forceLogin) self.fbLogin.call(self);
		}
	});
	if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, false);
};


Evrythng.prototype.fbLogin = function(callback) {
	var self = this;
	if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, true);
	FB.login(function(response) {
		if (!response.authResponse) {
			if (typeof self.options.loadingCallback === 'function') self.options.loadingCallback.call(self, false);
			self.handleError({
				status: 0,
				type: 'facebook',
				message: 'FB User cancelled login or did not fully authorize'
			});
		}
		if (typeof callback === 'function') callback.call(self, response);
	}, {scope: 'publish_actions,email,user_birthday,user_location'});
};


Evrythng.prototype.fbCallback = function(response) {
	var self = this;
	if (response.status === 'connected') {
		if (response.authResponse) {
			if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, true);
			FB.api('/me', function(fbUser) {
				if (!fbUser.name) {
					self.fbLogin.call(self, self.fbCallback);
				}
				else {
					var data = {
							'access': {
								'token': response.authResponse.accessToken
							}
						};
					self.request({
						url: '/auth/facebook',
						data: data,
						method: 'post'
					}, function(access) {
						if (access.evrythngApiKey) {
							if (typeof self.options.loginCallback === 'function') {
								self.options.loginCallback.call(self, access, fbUser);
								if (typeof self.options.loadingCallback === 'function') self.options.loadingCallback.call(self, false);
							}
						}
					});
				}
			});
		}
		else {
			this.handleError({
				status: 0,
				type: 'facebook',
				message: 'Cannot login via Facebook'
			});
		}
	}
	else {
		if (response.status === 'not_authorized') {
			if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, false);
			this.handleError({
				status: 0,
				type: 'facebook',
				message: 'User is logged in to Facebook, but has not authenticated your app'
			});
		}
		else {
			if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, false);
			this.handleError({
				status: 0,
				type: 'facebook',
				message: 'User is not logged in to Facebook'
			});
		}
		/*
		location.href = 'https://www.facebook.com/connect/uiserver.php?app_id=' 
		 + this.options.facebookAppId + '&method=permissions.request&display=page&next=' 
		 + location.protocol + '//' + location.host + location.pathname + location.search 
		 + '&response_type=token&fbconnect=1&perms=publish_actions,email,user_birthday,user_location';
		*/
	}
};


Evrythng.prototype.fbPost = function(options, callback) {
	var self = this;
	/*FB.ui({
		method: 'stream.publish',
		message: options.message,
		attachment: options.attachment,
		action_links: options.action_links,
		user_prompt_message: options.user_prompt_message
	},
	function(response) {
		if (window.console) console.log(response);
		if (response && response.post_id) {
			if (window.console) console.log('Post was published');
		}
		else {
			if (window.console) console.log('Post was not published');
		}
		if (typeof callback === 'function') {
			callback.call(self, response);
		}
	});*/
	//if (typeof this.options.loadingCallback === 'function') this.options.loadingCallback.call(this, true);
	var post = {
		message: options.message,
		picture: options.picture,
		link: options.link,
		name: options.name,
		description: options.description
	};
	if (options.tags) post.tags = options.tags;
	if (options.place) post.place = options.place;
	FB.api('/' + (options.user || 'me') + '/feed', 'post', post, function(data) {
		//if (typeof self.options.loadingCallback === 'function') self.options.loadingCallback.call(self, false);
		if (typeof callback === 'function') {
			callback.call(self, data);
		}
	});
};


Evrythng.prototype.fbFriends = function(options, callback) {
	var self = this;
	FB.api('/' + (options.user || 'me') + '/friends', function(response) {
		if (typeof callback === 'function' && response.data) {
			var friends = response.data;
			if (options && options.orderBy === 'name') {
				friends = response.data.sort(function(a, b) {
						var x = a.name.toLowerCase();
						var y = b.name.toLowerCase();
						return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				})
			}
			callback.call(self, friends);
		}
	});
};


/*
	Error Handler
*/
Evrythng.prototype.handleError = function(options, callback) {
	if (window.console) console.error('Evrythng.js Error', options);
	if (typeof callback === 'function') callback.call(this, options);
	if (typeof this.options.onError === 'function') this.options.onError.call(this, options);
};


/*
	CORS request
*/
Evrythng.prototype.createCORSRequest = function(method, url) {
	var xhr;
	xhr = new XMLHttpRequest();
	if (xhr.withCredentials != null) {
		xhr.open(method, url, true);
	}
	else if (typeof XDomainRequest !== 'undefined') {
		xhr = new XDomainRequest();
		xhr.open(method, url);
	}
	else {
		xhr = null;
	}
	return xhr;
};


/*
	CORS wrapper
*/
Evrythng.prototype.cors = function(options, callback, errorHandler) {
	var self = this, method = options.method || 'GET';
	if (typeof this.options.jQuery === 'function') {
		if (!this.options.jQuery.support.cors) return null;
		var promise = this.options.jQuery.ajax({
			type: method,
			url: options.url,
			// workaround for DELETE request, which returns empty string (invalid JSON)
			dataType: (method.toLowerCase() === 'delete') ? 'text' : 'json',
			data: options.data,
			processData: false,
			contentType: 'application/json',
			headers: {
				Accept: 'application/json',
				Authorization: options.evrythngApiKey
			},
			error: function(e) {
				self.handleError({
					status: e.status,
					type: e.responseJSON ? 'server' : 'cors',
					message: (e.responseJSON ? 'Server responded with an error for the CORS request' : 'Cannot establish CORS connection') + ' (using jQuery)',
					url: options.url,
					method: method,
					originalError: e,
					responseError: e.responseJSON
				}, errorHandler);
			}
		});
		return (typeof callback === 'function') ? promise.then(callback) : promise;
	}
	else {
		var xhr = this.createCORSRequest(method, options.url);
		if (xhr) {
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.setRequestHeader('Accept', 'application/json');
			xhr.setRequestHeader('Authorization', options.evrythngApiKey);
			xhr.onload = function(e) {
				if (xhr.status.toString().indexOf('2') === 0) {
					if (typeof callback === 'function') callback.call(self, xhr.response ? JSON.parse(xhr.response) : '', xhr.status, xhr);
				}
				else {
					self.handleError({
						status: xhr.status,
						type: 'server',
						message: 'Server responded with an error for the CORS request',
						url: options.url,
						method: method,
						originalError: e,
						responseError: xhr.response ? JSON.parse(xhr.response) : ''
					}, errorHandler);
				}
			};
			xhr.onerror = function(e) {
				self.handleError({
					status: xhr.status,
					type: 'cors',
					message: 'Cannot establish CORS connection',
					url: options.url,
					method: method,
					originalError: e,
					responseError: xhr.response ? JSON.parse(xhr.response) : ''
				}, errorHandler);
			};
			xhr.send(options.data);
		}
		return xhr;
	}
};


/*
	JSONP wrapper
*/
Evrythng.prototype.jsonp = function(options, callback, errorHandler) {
	var self = this;
	if (typeof this.options.jQuery === 'function') {
		var promise = this.options.jQuery.ajax({
				dataType: 'json',
				url: options.url,
				timeout: 10000,	// workaround for error handling
				error: function(xhr, status, error) {
					self.handleError({
						status: xhr.status,
						type: 'jsonp',
						message: 'Cannot establish JSONP connection (using jQuery)',
						url: options.url,
						method: 'GET',
						originalError: xhr,
						responseError: null
					}, errorHandler);
				}
			}),
			callbackWrapper = function(data, status, xhr) {
				if (data.errors && data.status) {
					self.handleError({
						status: data.status,
						type: 'server',
						message: 'Server responded with an error for the JSONP request (using jQuery)',
						url: options.url,
						method: 'GET',
						originalError: null,
						responseError: xhr.responseJSON
					}, errorHandler);
				}
				else {
					callback.call(self, data);
				}
			};
				
		return (typeof callback === 'function') ? promise.then(callbackWrapper) : promise;
	}
	else {
		return load.jsonp(options.url, function(data) {
			if (data.errors && data.status) {
				self.handleError({
					status: data.status,
					type: 'server',
					message: 'Server responded with an error for the JSONP request',
					url: options.url,
					method: 'GET',
					originalError: null,
					responseError: data
				}, errorHandler);
			}
			else {
				if (typeof callback === 'function') callback.call(self, data);
			}
		}, true, function(error) {
			self.handleError({
				status: 0,
				type: 'jsonp',
				message: 'Cannot establish JSONP connection',
				url: options.url,
				method: 'GET',
				originalError: error,
				responseError: null
			}, errorHandler);
		});
	}
};


/*
	HTTP Request utility
*/
Evrythng.prototype.request = function(options, callback, errorHandler) {
	var self = this,
		corsResult;
	if (this.options.evrythngApiCorsUrl) {
		var corsOptions = {
			url: this.options.evrythngApiCorsUrl + options.url
				+ (options.url.indexOf('?') > -1 ? '&' : '?')
				+ this.buildParams(options.params),
			evrythngApiKey: options.evrythngApiKey || this.options.evrythngApiKey
		};
		if (options.method) corsOptions.method = options.method;
		if (options.data) corsOptions.data = JSON.stringify(options.data);
		corsResult = this.cors(corsOptions, function(response, status, xhr) {
			if (typeof callback === 'function') {
				var hs = (xhr && xhr.getAllResponseHeaders ? xhr.getAllResponseHeaders() : undefined),
					headers = {},
					header;
				if (hs) {
					hs = hs.split('\n');
					for (var i=0; i<hs.length; i++) {
						if (!hs[i].trim()) continue;
						header = hs[i].split(':');
						headers[header[0].trim().toLowerCase()] = header[1].trim();
					}
				}
				callback.call(self, response, headers);
			}
			return response;
		}, errorHandler);
	}
	if (corsResult) {
		return corsResult;
	}
	else {
		if (typeof options.params !== 'object') options.params = {};
		if (options.method) options.params.method = options.method;
		if (options.data) options.params.data = JSON.stringify(options.data);
		options.params.access_token = options.evrythngApiKey || this.options.evrythngApiKey;
		return this.jsonp({
			url: this.options.evrythngApiJsonpUrl
				+ options.url
				+ (options.url.indexOf('?') > -1 ? '&' : '?')
				+ 'callback=?&'
				+ this.buildParams(options.params)
			}, function(response) {
			if (typeof callback === 'function') {
				callback.call(self, response);
			}
			return response;
		}, errorHandler);
	}
};


/*
	Helper method to build a resource path
	e.g., buildUrl('/thngs/%s', thngId);
*/
Evrythng.prototype.buildUrl = function(str) {
		var args = [].slice.call(arguments, 1), i = 0;
		return str.replace(/%s/g, function() {
				return args[i++];
		});
};


/*
	Helper method to build query string
*/
Evrythng.prototype.buildParams = function(obj) {
	var out = [];
	for (var i in obj) {
		out.push(i + '=' + encodeURIComponent(obj[i]));
	}
	return out.join('&');
};


/*
	Helper method to read URL parameter
*/
Evrythng.prototype.getParam = function(name) {
	name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
		results = regex.exec(location.search);
	return results == null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


/*
	Helper to escape html
*/
Evrythng.prototype.escapeHTML = function(str) {
	var pre = document.createElement('pre');
	pre.appendChild(document.createTextNode(str));
	return pre.innerHTML;
};


/*
	Helper to get mime type by file's extension
*/
Evrythng.prototype.getMimeType = function(ext) {
	return (function() {
		var a = 'audio/',
			v = 'video/',
			i = 'image/';
		return {
			//-- image
			'jpg':i+'jpeg',
			'jpeg':i+'jpeg',
			'png':i+'png',
			'gif':i+'gif',
			//-- audio
			'flac':a+'flac',
			'mp3':a+'mpeg',
			'm4a':a+'aac',
			'm4b':a+'aac',
			'm4p':a+'aac',
			'm4r':a+'aac',
			'aac':a+'aac',
			'adts':a+'aac',
			'wav':a+'wav',
			'bwf':a+'wav',
			'aiff':a+'aiff',
			'aif':a+'aiff',
			'aifc':a+'aiff',
			'cdda':a+'aiff',
			'au':a+'basic',
			'snd':a+'basic',
			'ulw':a+'basic',
			'mid':a+'midi',
			'midi':a+'midi',
			'smf':a+'midi',
			'kar':a+'midi',
			'qcp':a+'vnd.qcelp',
			'gsm':a+'x-gsm',
			'amr':a+'amr',
			'caf':a+'x-caf',
			'ac3':a+'ac3',
			'm2a':a+'mpeg',
			'swa':a+'mpeg',
			'wma':a+'x-ms-wma',
			'wax':a+'x-ms-wax',
			'mpga':a+'mpeg',
			'mpega':a+'mpeg',
			'3gpp2':a+'3gpp2',
			'oga':a+'ogg',
			//-- video
			'3gp':v+'3gpp',
			'3gpp':v+'3gpp',
			'3g2':v+'3gpp2',
			'3gp2':v+'3gpp2',
			'h261':v+'h261',
			'h263':v+'h263',
			'h264':v+'h264',
			'jpgv':v+'jpeg',
			'jpm':v+'jpm',
			'jpgm':v+'jpm',
			'mj2':v+'mj2',
			'mjp2':v+'mj2',
			'mp4':v+'mp4',
			'mp4v':v+'mp4',
			'mpg4':v+'mp4',
			'm4u':v+'x-mpegurl',
			'mp2':v+'mpeg',
			'mpm':v+'mpeg',
			'mpa':v+'mpeg',
			'mpeg':v+'mpeg',
			'mpg':v+'mpeg',
			'mpe':v+'mpeg',
			'mpv':v+'mpeg',
			'mp2v':v+'mpeg-2',
			'mpv2':v+'mpeg-2',
			'm1s':v+'mpeg',
			'm1a':v+'mpeg',
			'm75':v+'mpeg',
			'm15':v+'mpeg',
			'm1v':v+'mpeg',
			'm2v':v+'mpeg',
			'qt':v+'quicktime',
			'mov':v+'quicktime',
			'mqv':v+'quicktime',
			'fvt':v+'vnd.fvt',
			'mxu':v+'vnd.mpegurl',
			'm4u':v+'vnd.mpegurl',
			'viv':v+'vnd.vivo',
			'vivo':v+'vnd.vivo',
			'fli':v+'fli',
			'flc':v+'flc',
			'cel':v+'flc',
			'asr':v+'x-ms-asf',
			'asf':v+'x-ms-asf',
			'asx':v+'x-ms-asx',
			'lsf':v+'x-la-asf',
			'lsx':v+'x-la-asf',
			'wm':v+'x-ms-wm',
			'wmp':v+'x-ms-wmp',
			'wmv':v+'x-ms-wmv',
			'wmx':v+'x-ms-wmx',
			'wvx':v+'x-ms-wvx',
			'avi':v+'x-msvideo',
			'avs':v+'avs-video',
			'mv':v+'x-sgi-movie',
			'movie':v+'x-sgi-movie',
			'ice':'x-conference/x-cooltalk',
			'f4v':v+'mp4',
			'f4p':v+'mp4',
			'flv':v+'flv',
			'swf':'application/x-shockwave-flash',
			'spl':'application/futuresplash',
			'dxr':'application/x-director',
			'dir':'application/x-director',
			'dcr':'application/x-director',
			'divx':v+'divx',
			'div':v+'divx',
			'dv':v+'x-dv',
			'dif':v+'x-dv',
			'dl':v+'dl',
			'gl':v+'gl',
			'ogv':v+'ogg',
			'ogg':'application/x-ogg',
			'ogx':'application/ogg',
			'axv':v+'annodex',
			'anx':'application/annodex',
			'afl':v+'animaflex',
			'fmf':v+'x-atomic3d-feature',
			'isu':v+'x-isvideo',
			'mjpg':v+'x-motion-jpeg',
			'qtc':v+'x-qtc',
			'rv':v+'vnd.rn-realvideo',
			'ra':'audio/x-pn-realaudio',
			'ram':'audio/x-pn-realaudio',
			'rm':'audio/x-pn-realaudio-plugin',
			'rpm':'audio/x-pn-realaudio-plugin',
			'rpj':'application/vnd.rn-realplayer-javascript',
			'scm':v+'x-scm',
			'vdo':v+'vdo',
			'vos':v+'vosaic',
			'xdr':v+'x-amt-demorun',
			'xsr':v+'x-amt-showrun',
			'sdv':v+'sd-video',
			'vob':v+'mpeg-system',
			'm4v':v+'x-m4v',
			'vlc':'application/x-vlc-plugin',
			'amc':'application/x-mpeg'
		};
	})()[ext];
};


/*
	Load.js - JavaScript js/css, jsonp/ajax, sync/async loader
	Docs and source: https://github.com/articobandurini/load.js
*/
(function(b){var a=b.load=function(d){if(typeof d!=="object"||d instanceof Array){var c=a.args(arguments);d={url:c.url,callback:c.callback}}if(d.url&&d.url.length){if(typeof d.async==="undefined"){d.async=true}if(!d.type){d.type="js"}if(!(d.url instanceof Array)){d.url=[d.url]}a.sequence(d)}return a};a.sequence=function(e){var d=e.url.length,c=function(h){if(!h){h=1}d=d-h;if(!d&&typeof e.callback==="function"){e.callback.call(a)}},g=function(h){return h.length?(function(){c(h.length);a.sequence({url:h,async:e.async,type:e.type,callback:c})}):c};for(var f=0;f<e.url.length;f++){if(e.url[f] instanceof Array){a.sequence({url:e.url[f],async:e.async,type:e.type,callback:g(e.url.slice(f+1))});break}else{a.one({url:e.url[f],async:e.async,type:e.type,callback:c})}}return a};a.one=function(d){var c,f=false,e=document.getElementsByTagName("head")[0]||document.body;if(d.url in a.map){d.url=a.map[d.url]}if(d.type==="css"||d.url.toLowerCase().match(/\.css$/)){f=true;c=document.createElement("link");c.rel="stylesheet";c.href=a.path(d.url+(d.url.toLowerCase().match(/\.css$/)?"":".css"))}else{c=document.createElement("script");c.async=d.async;c.src=a.path(d.url+(d.type==="jsonp"||d.url.toLowerCase().match(/\.js$/)?"":".js"))}e.appendChild(c);var g=function(i){if(typeof a.ready==="function"){a.ready.call(a,d.url)}if(typeof d.callback==="function"){d.callback.call(a)}if(!f&&i&&i.parentNode){i.parentNode.removeChild(i)}};var h=navigator.userAgent.match(/MSIE\s(\d+)/);if(h&&h[1]<11){c.onreadystatechange=function(){if(this.readyState==="loaded"||this.readyState==="complete"){g(this)}}}else{c.onload=function(){g(this)}}if(typeof d.errorHandler==="function"){c.onerror=function(i){d.errorHandler.call(a,i)}}return a};a.js=a.async=function(){var c=a.args(arguments);return a({url:c.url,callback:c.callback})};a.css=function(){var c=a.args(arguments);return a({url:c.url,callback:c.callback,type:"css"})};a.sync=function(){var c=a.args(arguments);return a({url:c.url,callback:c.callback,async:false})};a.jsonp=function(d,f,e,c){if(typeof f==="function"){if(!a.jsonp.index){a.jsonp.index=1}else{a.jsonp.index++}window["loadCallback"+a.jsonp.index]=f;d=d.replace("=?","=loadCallback"+a.jsonp.index)}return a.one({url:d,async:e!==false,type:"jsonp",errorHandler:c})};a.ajax=function(d,i,f,c){var h;if(window.XMLHttpRequest){h=new XMLHttpRequest()}else{if(window.ActiveXObject){try{h=new ActiveXObject("Msxml2.XMLHTTP")}catch(g){try{h=new ActiveXObject("Microsoft.XMLHTTP")}catch(g){}}}}if(!h){return null}h.onreadystatechange=function(){if(h.readyState===4&&typeof i==="function"){i.call(h,h.responseText)}};if(typeof c==="function"){h.onerror=function(j){c.call(a,j)}}h.open("GET",a.path(d),f);h.send();return a};a.min=function(c,f){if(c&&typeof c==="string"){c=[c]}if((c instanceof Array)&&(typeof f==="function"?f.call(a):true)){for(var e=0;e<c.length;e++){var d="",g=/\.(js|css)$/i;if(c[e].match(g)){d=c[e].replace(g,function(h,j,k,i){return".min."+j})}else{d=c[e]+".min"}a.map[c[e]]=d}}return a};a.args=function(c){var d=Array.prototype.slice.call(c);return{url:d,callback:(typeof d[d.length-1]==="function")?d.pop():undefined}};a.path=function(c){return c.match(/^(https?\:|file\:|\/)/i)?c:a.root+c};a.init=function(){a.root="";a.map={};var f=document.getElementsByTagName("script"),d,e;for(var c=0;c<f.length;c++){if(f[c].src.match(/(^|\/)load(\.min)?\.js$/)||f[c].id==="load.js"){d=f[c].getAttribute("data-load");if(d){e=d.lastIndexOf("/")+1;a.root=e?d.substring(0,e):"";a({url:d.substring(e),async:f[c].getAttribute("data-async")!=="false"})}break}}};a.init()})(window);
