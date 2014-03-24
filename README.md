everythng.js
===========

Client-side JavaScript library to access EVRYTHNG API.

## Use it from our CDN

Simply reference 

    http://cdn.evrythng.net/toolkit/evrythng-js-wrapper/evrythng-1.2.1.min.js

for HTTPS support use: 

    //d10ka0m22z5ju5.cloudfront.net/toolkit/evrythng-js-wrapper/evrythng-1.2.1.min.js 
    
in your javascript code.

## Initialization

Just create an instance of Evrythng class:

    Evt = new Evrythng();

You can also set initial options:

    Evt = new Evrythng({
        evrythngApiKey: 'xxxxxxxxxxxx'
    });

For security reasons, make sure the only key you put in your code is the App API key and not your Operator or User App key (see https://dev.evrythng.com/documentation/api#users).

## Using the library

evrythng.js includes many methods to interact with EVRYTHNG API, they called CRUD methods and follows this convention:

1.  CRUD methods named accordingly: read, create, update, delete. For example "readAction"
2.  All CRUD methods use following signature: method(options, callback, errorHandler)

_Example of CRUD call:_

    Evt.readAction({
        type: 'scans'
        
        // this is options object
        
    }, function(data) {
        
        // this is callback to get data
        
    }, function(error) {
        
        // this is errorHandler to get error data
        
    });

### Facebook & EVRYTHNG login

To ensure that App User Keys are never disclosed in the client-side code, user authentication to the EVRYTHNG API happens through delegated authentication via Facebook. Here is a snippet of code that lets you do that in a snap.

Basically this authenticates the user with the Facebook and then, using the Facebook token, with EVRYTHNG. At the end of the process you dynamically get an EVRYTHNG App User Key.

The call to `authFacebook` needs to be done with your App API Key. The call then returns the App User Key which you should use for all subsequent calls. 

    Evt.fbLogin(function(fbData) {
    
        // With the response from Facebook (which contains the access tokens we 
        // need for the user), go ahead and register this user with the 
        // EVRYTHNG engine...
    
        Evt.authFacebook({ 
            data: { 
                access: { 
                    token: fbData.authResponse.accessToken 
                } 
            } 
        }, function(evtData) {
        
            // Response from EVRYTHNG
            console.log(evtData);
        
        });     
    
    });


## Configuration

### Options

    evrythngApiUrl              CORS or JSONP API URL (missing one will be deduced)
    evrythngApiCorsUrl          CORS API URL
    evrythngApiJsonpUrl         JSONP API URL

    evrythngApiKey              API key, this should be your App API key.
    evrythngAppId               id of Evrythng application
    facebookAppId               id of Facebook application
    
    disableGeolocation          boolean, false by default
    actionButton                reference to the DOM element to do FB login on click
    forceLogin                  don't wait for actionButton click, false by default
    
    loginCallback               function, called upon Evrythng login
    loadingCallback             function, called upon change of loading state
    
    jQuery                      reference to jQuery object

All options can be read and written later via "options" property:

    Evt.options.disableGeolocation = true;


### jQuery

The library can work both with and without jQuery.

You might not need jQuery in case you don't have it in your project,
but in some cases it can be useful (e.g. for RSVP/Deferred functionality to work with Ember.js).

In order to use jQuery, pass its reference as an option:

    Evt = new Evrythng({
        jQuery: jQuery
    });

Please note, when you use jQuery all transport operations will be performed with jQuery methods.
All evrythng.js methods involving server requests will return Deferred object, so you can use .then() method for example:

    Evt.readProduct({}).then(function(data) {
        // here you have response data
    });



### CORS and JSONP

EVRYTHNG API is accessed via CORS, but if it's not supported, then JSONP fallback is used.
If you want to specify custom URLs for the API, you can do it in two ways:

1. Specify only "evrythngApiUrl" option, it can be either CORS or JSONP API URL (missing one will be deduced).
   Note that both URLs have to follow the convention: hostname starts with "api" for CORS and with "js-api" for JSONP.
2. Specify both "evrythngApiCorsUrl" and "evrythngApiJsonpUrl" options accordingly. URL convention can be ignored in this case.



### Error handling

The library can help you to handle errors in a few ways:

1.  errorHandler third argument for CRUD methods (and some other methods as well).
2.  onError callback option for EVRYTHNG instance to get all errors in one place.
3.  browser's console: all errors go there, no configuration is needed for that.

_Example of using onError callback:_

    Evt = new Evrythng({
        onError: function(error) {
            
            // here you get all errors
            
        }
    });

Object that comes as an agrument to errorHandler has following properties:

    status (integer, mandatory)         HTTP status or 0 if not applicable
    message (string, mandatory)         message about the reason of the error
    type (string, mandatory)            server / cors / jsonp / facebook / upload
    
    method (string, optional)           in case it's a tranport error, will hold the HTTP method
    url (string, optional)              in case it's a tranport error, will hold the URL requested

    originalError (object, optional)    error object passed directly from executor e.g. XMLHttpRequest or jQuery
    responseError (object, optional)    in case it's an API error, this will hold the response from the server

If the type of the error is "server", then you will have the "responseError" as well:

    Evt.readAction({}, null, function(error) {
        if (error.type === 'server') {
            
            // now you can get more info from the server response:
            // error.responseError.moreInfo
            
        }
    });

## Advanced features

### Upload

evrythng.js comes with built-in ajax upload functionality, with advanced features:

1.  ability to upload to Amazon S3 as well as to any custom server.
2.  upload signature by the EVRYTHNG Files API.
3.  generation of a thumbnail for video or image directly in the browser, and upload it along with the file.
4.  file data can be sent as raw as well as a part of a form (for simple backends).

Example:

    Evt.createUpload({
        
        // here you can set upload options
        
    });


### Upload options

    method              HTTP method to use for upload (usually PUT or POST)
    uploadUrl           URL for upload (must not be used for Amazon S3 upload)
    useFormData         send file as raw data or as part of a usual form (false by default)
    formDataName        if useFormData is true, then field name has to be set ("file" by default)
    force               start upload upon file select or wait for a "handleFileInput" method call (false by default)
    
    thumbnailFor        array of file types to generate thumbnail for (if not set - thumbnail will not be generated)
    thumbnailUrl        url to upload thumbnail
    thumbnailWidth      width of thumbnail (178 by default)
    thumbnailHeight     height of thumbnail (100 by default)
    thumbnailType       image type for thumbnail ("image/jpeg" by default)
    thumbnailQuality    quality of thumbnail in case of its type is "jpeg" (0.92 by default)
    thumbnailPrefix     prefix to use for thumbnail file name (used for Amazon S3 upload, "_thumbnail_" by default)
    thumbnailResample   use or not image resampling for better quality (true by default, a bit slower than simple resize)
    
    onProgress          progress callback, arguments: percent, status message
    onFinish            finish callback, arguments: public_url, size
    onError             error callback, arguments: error object


#Referring evrythng.js in projects

##Overview
The javascript wrapper `evrythng.js` is under version control in `evrythng-tools` project.

It needs to be referred from different projects, using different manners during development cycles of those projects.

* An instant local version can be used during development
* The latest version available in github can be used for Test environments
* Two released versions:
    * One for production
    * One for demo

This page explains how to setup `evrythng.js` in your project

##Instant development release
A good solution consists in the usage of `get-evrythngjs` script to instantly push the local modifications and copy the file from `evrythng-tools` into different locations.

* get-evrythngjs utility is available in evrythng-tools repository
* Customize your file source and destinations by making a copy of get-evrythngjs.properties into your own get-evrythngjs.user.properties
* Run the script : java -jar get-evrythngjs nogui
* Alternatively run the script in watcher mode. Any change will be automatically copied to the destination dirs : java -jar get-evrythngjs watch
* Alternatively use the "GetEvrythng Mac OS X" builder in Eclipse to call the script whenever the workspace is built

Documentation of portal project explains how this solution is enabled for that particular project.

        https://github.com/evrythng/evrythng-devportal

##CDN version for demo and production
See Updating the CDN with evrythng-js-sdk

##Github version
Using the automatic generator feature of github, the content of a repository can be accessed via a specific url.

Thus, the evrythng-tools project is, and specifically the js wrapper is accessible here :

http://evrythng.github.io/evrythng-tools/evrythng-js-wrapper/evrythng.js

This url can be used for Test environment, and for development process which does not require to update the evrythng.js file an instantly see the changes

To update this published version of the repository, it must be pushed in a specific gh-pages branch.

        git push origin master:gh-pages

This will update the published site with the current master HEAD

More about this github feature :

https://help.github.com/articles/creating-pages-with-the-automatic-generator

##Updating the CDN with evrythng-js-sdk
###Requirements
This short section should outline the requirements of the reader to use the guide.
Instructions
Make sure you have versions the file, in the license  and evrythngtools_version var
Logon to the jumpbox
Make sure you have AWS KEYS in your env
You can do this by running:-

    bashton@live-ops-bashton11:/opt/evrythng/adm-scripts# export  | grep AWS
    declare -x AWS_ACCESS_KEY="DSFSDFDSfsSD"
    declare -x AWS_SECRET_KEY="FDEFWEfwefew"

Kick Ben if nothing shows up, but in the mean time, input the KEYS yourself
Go to /opt/evrythng/adm-scripts and run the script cp_evrythng-js-wrapper2cf.sh {env to deploy}  e.g.: /opt/evrythng/adm-scripts/cp_evrythng-js-wrapper2cf.sh demo
Tips & Warnings
It costs a lot of money to invalidate content from CloudFront, dont go stupid with invalidations. 

Deploying Demo evrythng.js
Do a git push on the demo branch of https://github.com/evrythng/evrythng-js-sdk/ and it will appear here:-

//evrythngjsdemo.s3.amazonaws.com/evrythng-$(git rev-list --count HEAD).js
You will get a email to confirm this


