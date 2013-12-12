Evrythng.js
===========

Client-side JavaScript library to access Evrythng API.

## Initialization

The library can work both with and without jQuery.

Moreover it can work both with and without CORS support using JSONP fallback.

	Evt = new Evrythng({
		evrythngApiKey: 'iZpKaNclRS...vuo59MouTs42',
		evrythngApiCorsUrl: 'https://api...evrythng.net',
		evrythngApiJsonpUrl: 'https://js-api...evrythng.net',
		other options...
	});

If you have to use jQuery (e.g. to use it with Ember.js), pass it's reference as an option:

	Evt = new Evrythng({
		jQuery: jQuery
	});

