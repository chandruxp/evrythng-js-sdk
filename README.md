# [Evrythng](https://www.evrythng.com) Client JavaScript SDK

evrythng.js is a [UMD](link here)-compatible JavaScript library for Client-side applications
interacting with the Evrythng API.

**We are updgrading EvrythngJS to the new 2.0 version. In the meantime, please refer to 
the [`v.1.x` branch](https://github.com/evrythng/evrythng-js-sdk/tree/v1.x) for the previous documentation.**

## Installation

### Bower

Use:

    bower install evrythng-js-sdk

Or include the script from our CDN in your HTML file using:

    <script src="//cdn.evrythng.net/toolkit/evrythng-js-sdk/evrythng.js"></script>

### AMD (RequireJS) & CommonJS

This module can also be loaded as an AMD or CommonJS module.


## Usage

Example using RequireJS:

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

Using Node.js:

    var EVT = require('evrythng');
    
    var app = new EVT.App('apiKey');
    ...

If you aren't using any of the above script loading mechanisms, the EVT module is available
as a browser global:

    var app = new EVT.App('apiKey');
    ...


**Note:** Be sure to only include your Evrythng App API key and **not** your Operator or User
App key in any public application code (read more [here](https://dev.evrythng.com/documentation/api#users)).


For advanced usage and options, see the documentation on [Evrythng's Developer
Portal](https://dev.evrythng.com/documentation). If you would like to know more about the
library's features and implementation you can also look at
the Developer Notes in `DEVELOPMENT.md`.

## Documentation

For in-depth documentation beyond the one provided here, please revert to the 
[Anotated Source Code](https://evrythng.github.io/evrythng-js-sdk/docs/evrythng.html).

## Configuration

<add configuration parameters here>

## Modules

<list and explain all the library modules here>

## Misc

Source Maps are available, which means that when using the minified version, if a developer opens the 
Developer Tools, .map files will be downloaded and help the developer debug code using the original version
of the code.

### Size

28.21 kB (min) → 5.55 kB (gzip)

## License

The MIT License in `LICENSE.txt`

Copyright (c) 2010-2013 yuanyan yuanyan.cao@gmail.com
