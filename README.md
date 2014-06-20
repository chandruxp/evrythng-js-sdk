# [EVRYTHNG](https://www.evrythng.com) Client JavaScript SDK

EvrythngJS is a [UMD](https://github.com/umdjs/umd)-compatible JavaScript library for Client-side applications
interacting with the EVRYTHNG API.

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

    <script src="//d10ka0m22z5ju5.cloudfront.net/toolkit/evrythng-js-sdk/evrythng-2.0.0.min.js"></script>

respectively

    <script src="//d10ka0m22z5ju5.cloudfront.net/toolkit/evrythng-js-sdk/evrythng.min.js"></script>
    
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

    ```javascript
    require(['evrythng'], function (EVT) {
    
      EVT.setup({
        apiUrl: 'xxx'
      });
        
      var app = new EVT.App('appApiKey');

      // Promise API
      app.product('123').read().then(function(prod){
      
        // Properties
        
        // update single property
        prod.property('status').update('off');
            
        // update multiple properties
        prod.property().update({
          status: 'off',
          level: '80'
        });
        
        // read current property
        console.log(prod.properties['status']);
        
        // read property history
        prod.property('status').read().then(function(statusHistory){
        
          console.log(statusHistory);
          
        });
        
        ...
      });
        
      // Login user and create user scope  
      app.login('facebook').then(function(response){
        
        // every call using user will use its User Api Key
        var user = response.user;
        
       
        // Manage thngs
        user.thng().read().then(function(thngs){
            
          thngs[0].description = 'newDesc';              
          return thngs[0].update();
                
        }).then(function(thng){
            
          console.log('thng updated');
                
        });
        
        user.thng('123').update({
          description: 'new desc'
        });
        
        var newThng = new EVT.Thng();
        newThng.name = 'name';
        newThng.description = 'desc';
        
        user.thng().create(newThng);
        
        
        // Actions
        
        user.thng('1').read().then(function(thng1){
          
          thng1.action('scans').create();
          
          thng1.action('_customAction').create({
            customFields: {
              foo: 'bar'
            }
          });
        
        });
        
        ...
      });
      
      
      // Callback API
      app.product().read(function(products){
      
        console.log(products);
        
      });
      
      // Raw API Calls and multiple API designs example
      var options = {
        url: '/products',
        method: 'post',
        authorization: 'userApiKey',
        success: function(product){
          console.log(product);
        },
        error: function(err){
          console.log(err);                            
        }
      }
      
      EVT.api(options).then(successHandler, errorHandler);
      
      EVT.api(options);
      
      EVT.api(options, successCb, errorCb);
      
      ...
    });
    ```

### Node.js

    ```javascript
    var EVT = require('evrythng');
    
    var app = new EVT.App('apiKey');
    ...
    ```

### Browser Globals

If you aren't using any of the above script loading mechanisms, the EVT module is available
as a browser global:

    ```javascript
    var app = new EVT.App('apiKey');
    ...
    ```

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
