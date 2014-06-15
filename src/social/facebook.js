define([
  'rsvp',
  'utils'
], function (RSVP, Utils) {
  /* global FB */
  'use strict';

  // Load FB SDK asynchronously (using RequireJS) and get status
  // of logged in user, if any
  function init(appId) {

    // Return promise and resolve once user status is retrieved
    return new RSVP.Promise(function(resolve){
      window.fbAsyncInit = function () {
        // Initialize FB using Evryhtngs Facebook App ID
        FB.init({
          appId: appId,
          version: 'v2.0'
        });

        // Get Login status and user info if connected
        FB.getLoginStatus(function (response) {

          // response = authResponse + status
          _getUser(response).then(function(userResponse){

            // userResponse = authResponse + status + user
            resolve(userResponse);
          });
        });
      };

      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    });
  }

  // Invoke FB login popup, using specified options
  function login(options) {

    // Return promise and resolve once user info is received
    return new RSVP.Promise(function (resolve, reject) {

      // Call Facebooks login method
      FB.login(function (response) {

        // response = authResponse + status
        _getUser(response).then(function (userResponse) {

          // userResponse = authResponse + status + user
          if(userResponse.user) {
            resolve(userResponse);
          } else {
            reject(userResponse);
          }

        });
      }, options);

    });
  }

  // Invoke FB logout and return promise
  function logout() {

    // Return promise and resolve once user info is received
    return new RSVP.Promise(function (resolve) {

      // Call Facebooks logout method
      FB.logout(function (response) {
        resolve(response);
      });

    });
  }

  // Get user info if successfully connected
  function _getUser(response) {
    if(response.status == 'connected') {

      // Get user details
      return new RSVP.Promise(function (resolve) {
        FB.api('/me', function (userInfo) {
          resolve(Utils.extend(response, { user: userInfo }));
        });
      });

    }else{
      return new RSVP.Promise(function (resolve) {
        resolve(response);
      });
    }
  }

  // Export only init and login methods
  return {
    init: init,
    login: login,
    logout: logout
  };

});