// ## FACEBOOK.JS

// **The Facebook module exports wrapped *login*, *logout* and *init* methods
// from the Facebook SDK, always returning Promises.**

define([
  'npo',
  'utils'
], function (Promise, Utils) {
  'use strict';
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