// ## AUTHENTICATION.JS

// **Authentication provides a complete abstraction layer on top of
// the provided *'/auth/...'* endpoints in the REST API. Logging in with
// Evrythng or Facebook uses the same method and provide a similar response.**

// **Authentication with Facebook needs an app that has been created using the
// `facebook: true` option, which will load and init the Facebook SDK.**

define([
  'core',
  'npo',
  'social/facebook',
  'utils',
  'ajax'
], function (EVT, Promise, Facebook, Utils) {
  'use strict';

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