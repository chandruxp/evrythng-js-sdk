# [EVRYTHNG](https://www.evrythng.com) Client JavaScript SDK

EvrythngJS is a [UMD](https://github.com/umdjs/umd)-compatible JavaScript library for Client-side applications
interacting with the Evrythng API.

**We are updgrading EvrythngJS to the new 2.0 version. In the meantime, please refer to 
the [`v.1.x` branch](https://github.com/evrythng/evrythng-js-sdk/tree/v1.x) for the previous documentation.**

## Installation

### Browser

Use `Bower`:

    bower install evrythng

Or include the script from our CDN in your HTML file using:

    <script src="//cdn.evrythng.net/toolkit/evrythng-js-sdk/evrythng-2.0.0.min.js"></script>
 
Or always get the last stable release:

    <script src="//cdn.evrythng.net/toolkit/evrythng-js-sdk/evrythng.js"></script>
    <script src="//cdn.evrythng.net/toolkit/evrythng-js-sdk/evrythng.min.js"></script>
    
For HTTPs you'll have to use:

    <script src="https://d10ka0m22z5ju5.cloudfront.net/toolkit//evrythng-js-sdk/evrythng-2.0.0.min.js"></script>

respectively

    <script src="https://d10ka0m22z5ju5.cloudfront.net/toolkit//evrythng-js-sdk/evrythng.min.js"></script>
    
### Node.js

EvrythngJS is also available as an NPM package. Install it using:

    npm install evrythng


## Usage

EvrythngJS uses UMD, which makes it available everywhere that runs Javascript.

For advanced usage and options, see the API documentation on [Evrythng's Developer
Portal](https://dev.evrythng.com/documentation), and the Documentation section below. 

**Note:** Be sure to only include your EVRYTHNG App API key and **not** your Operator or User
App key in any public application code (read more [here](https://dev.evrythng.com/documentation/api#users)).

### AMD (RequireJS)

    require(['evrythng'], function (EVT) {
    
        EVT.setup({
            apiUrl: 'xxx',
            fullResponse: true
        });
        
        var app = new EVT.App('appApiKey');

        app.product('123').read().then(function(prod){
            ...
        });
        
        app.login('facebook').then(function(response){
            var user = response.user;
            
            user.thng().read().then(function(thngs){
            
                thngs[0].description = 'newDesc';              
                return thngs[0].update();
                
            }).then(function(thng){
            
                console.log('thng updated');
                
            });
        });
        
        ...
    });

### Node.js

    var EVT = require('evrythng');
    
    var app = new EVT.App('apiKey');
    ...

### Browser Globals

If you aren't using any of the above script loading mechanisms, the EVT module is available
as a browser global:

    var app = new EVT.App('apiKey');
    ...

## Documentation

For in-depth documentation beyond the one provided here, please have a look at the 
[Annotated Source Code](https://evrythng.github.io/evrythng-js-sdk).

The [EVRYTHNG API is documented here](https://dev.evrythng.com/documentation/api).

## Source Maps

Source Maps are available, which means that when using the minified version, if a developer opens the 
Developer Tools, .map files will be downloaded to help the developer debug code using the original version
of the code.

### Size

28.21 kB (min) → 5.55 kB (gzip)

## Development

Check the Development Notes in `DEVELOPMENT.md`.

### Testing

Run tests by:

    grunt test // unit testing with Karma + PhantomJS
    
    grunt test:dist // test UMD in Chrome (AMD + browser globals) and Node
    
    grunt test:sauce // browser globals test in multiple browsers in SauceLabs

## License

Apache 2.0 License, check `LICENSE.txt`

Copyright (c) EVRYTHNG Ltd.
