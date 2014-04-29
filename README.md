evrythng.js
==========

Client-side JavaScript library to access EVRYTHNG API.

## Use it from our CDN
To add **evrythng.js** to your site, you can just use our CDN to serve the file by using a
script tag like this:

    <script src='//d10ka0m22z5ju5.cloudfront.net/toolkit/evrythng-js-wrapper/evrythng-1.2.3.min.js'></script>

Alternatively, you can download the library from 
[the same URL](//d10ka0m22z5ju5.cloudfront.net/toolkit/evrythng-js-wrapper/evrythng-1.2.3.min.js)
and serve it from your own server.

Whatever version you are using, you can always find the latest version of evrythng.js at:

    d10ka0m22z5ju5.cloudfront.net/toolkit/evrythng-js-wrapper/evrythng.min.js

But please be aware that we may introduce backwards incompatible changes into the 
library now and then. So we do suggest that you use a numbered version of 
**evrythng.js** in the production version of your apps.


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

#Developing evrythng.js
##Grunt workflow
To develop `evrythng.js` you need to use [Grunt](http://gruntjs.com).

After you have cloned this repo, make sure the `grunt-cli` utility
is installed in your system as a global node-module. You can
install by issuing:

    npm install grunt-cli -g

Before you start coding, make sure you run: `npm install`  from the root folder
of your local copy of this repo to ensure you have all the necessary packages
for the different development tasks.

**Please notice** that every time you want to run a grunt command, you must do it
from the terminal and, specifically, from the root folder of your local copy
of this repository.

Also notice that if you need to deploy your changes, either to the production or
to the testing S3 buckets, you will need to have the necessary AWS keys set up 
properly (See [Preparing for Deployment](#preparing-for-deployment) ).

##JSHint
[JSHint](http://jshint.com) is a tool for detecting syntax errors and potential problems
in your javascript files.

The rules that are applied to this particular project are written in the `.jshintrc`
file, which is in the root folder of this repo.

You can run `grunt jshint` at any moment to verify that all your javascript
files pass the syntax check.

Currently (as of version 1.2.2) the main file (`evrythng.js`) is not passing
this check. Therefore, it has currently been excluded from being checked.
However, the test specs (which are also javascript files) are 
being checked.

##Testing
The current test suite requires the use of two additional libraries:
[Jasmine](http://jasmine.github.io) and [Sinon](http://sinonjs.org). 
These should have been installed for you when you ran `npm install`.

You can run the full test suite against the current codebase by
executing:

    grunt jasmine

You can also create a task that watches your javascript files (source files
and test files) and runs the full test suite every time any of those
files changes. To do that just run:

    grunt watch:jstest

##Building
The `build` grunt task will create a new build of the library by executing 
the following subtasks in the proper order:

* jshint
* jasmine
* concat (this concatenates the different source files)
* copy (makes a copy of the concatenaded file with no version in the filename)
* uglify (makes minified copies of both concatenated files)


As an additional step, The `concat` and `uglify` tasks add the necessary
banners at the beginning of their output files.

To invoke this whole build process you can execute:

    grunt build

Or simply:

    grunt

##Deploying
###Preparing for deployment
To be able to deploy either to production or to the testing
environments, you need to have the `AWS_ACCESS_KEY_ID` and
`AWS_SECRET_KEY` environment variables properly set up.

Alternatively you can have a file named `aws-keys.json`
with this content:

    {
        "AWSAccessKeyId": "aaaaaaaaaaaaaaaaaaaa",
        "AWSSecretKey": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    }

Of course, you need to replace these fake keys with your own ones.
You need to ask the ops person, as every developer needs to 
have **their own keys**.

After that, you are ready for deployment.


###Deploying to production
To deploy `everythng.js` you can run:

    grunt deploy

This task will build the library by actually calling `grunt build` and
if everything is fine it will attempt to do the following:

* `git tag` the current state of the repo with the package version
that is indicated in the `package.json` file.
* Upload all the compiled files to the correct S3 bucket, from where 
they will be copied to the CDN (Cloudfront).
* `git push --tags` to push your latest commits to GitHub alongside
the generated tag.

Make sure you change the version number in the `package.json` file
before deploying.

Currently, there are 4 files being deployed:

    evrythng.js
    evrythng.min.js
    evrythng-1.2.3.js
    evrythng-1.2.3.min.js

Where `1.2.3` will be replaced which whatever version number
is in `package.json`.

###Deploying a demo version for testing purposes
While in development, you can build and deploy `evrythng.js` 
to a different S3 bucket for testing.

For doing that, just execute:

    grunt deploydemo

After that, grunt will attempt to go through the same building 
process as
for the production deployment, but it will attempt to deploy 
two files (one minified and one unminified) with a timestamp
on their names so that they don't conflict with other demo
versions in use and to `evrythngjsdemo.s3.amazon.com` instead
of the production S3 bucket.


#Referring evrythng.js in projects

##Overview
There are several ways you can use `evrythng.js` for internal purposes.

* An instant local version can be used during development
* Two kinds of released versions:
    * Production
    * Demo

If you prefer not to use the deployment process or any of the
deployed versions of `evrythng.js`, have a look at 
[Instant development release](#instant-development-release) .

##Instant development release
A good solution consists in the usage of `get-evrythngjs` script to instantly 
push the local modifications and copy the file from `evrythng-tools` into different locations.

* get-evrythngjs utility is available in evrythng-tools repository
* Customize your file source and destinations by making a copy of get-evrythngjs.properties into your own get-evrythngjs.user.properties
* Run the script : java -jar get-evrythngjs nogui
* Alternatively run the script in watcher mode. Any change will be automatically copied to the destination dirs : java -jar get-evrythngjs watch
* Alternatively use the "GetEvrythng Mac OS X" builder in Eclipse to call the script whenever the workspace is built


##Tips & Warnings
It costs a lot of money to invalidate content from CloudFront, dont go stupid with invalidations. 
