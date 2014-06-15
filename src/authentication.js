define([
  'core',
  'rsvp',
  'social/facebook',
  'utils',
  'ajax'
], function (EVT, RSVP, Facebook, Utils) {
  'use strict';

  // Login into Evryhtng. Accepts:
  // - login('facebook')
  // - login('facebook', 'email,user_birthday')
  // - login({email/id: "", password: ""})
  function login(type, customOptions, successCallback, errorCallback) {
    var successCb = successCallback,
      errorCb = errorCallback;

    if(!type){
      throw new TypeError('Credentials (for Evrythng) or type (for Third party) are missing.');
    }

    // Authenticate using third parties
    if(Utils.isString(type)){

      // login with facebook
      if(type === 'facebook'){
        return _loginFacebook.call(this, customOptions, successCb, errorCb);

      }else if(type === 'evrythng') {
        return _loginEvrythng.call(this, customOptions, successCb, errorCb);
      }

    }else{

      // Evrythng login does not need first param - default method.
      // Call AuthEvrythng with shifted arguments.
      return _loginEvrythng.call(this, type, customOptions, successCb);

    }
  }

  // Login with Facebook. Custom Options are optional.
  function _loginFacebook(customOptions, successCallback, errorCallback) {
    var options = {scope: 'email'},
      $this = this;

    if(Utils.isFunction(customOptions) || customOptions === null){

      // If there are no customOptions, first param can be callback
      var temp = successCallback;
      successCallback = customOptions;
      errorCallback = temp;

    }else if(Utils.isObject(customOptions)){

      // If customOptions is object, use this instead of the defaults
      options = customOptions;

    }

    // Return promise and resolve only once authenticated with EVRYTHNG
    return new RSVP.Promise(function(resolve, reject) {

      // Login using Facebook with options above
      Facebook.login(options).then(function (userResponse) {

        // If successful, authenticate with Evrythng
        // and apply successCb and resolve promise
        authFb.call($this, userResponse).then(function (fullResponse) {
          if (successCallback) { successCallback(fullResponse);}
          resolve(fullResponse);
        });

      }, function (response) {

        // Login was not successful, apply errorCb and reject promise
        if (errorCallback) { errorCallback(response); }
        reject(response);

      });

    });
  }

  // Login with Evrythng
  function _loginEvrythng(credentials, successCallback, errorCallback) {
    if(!credentials || Utils.isFunction(credentials)) {
      throw new TypeError('Credentials are missing.');
    }

    return _authEvrythng.call(this, credentials).then(function (userResponse) {

      // Login was successful, apply callback and return promise value
      if(successCallback) { successCallback(userResponse); }
      return userResponse;

    }, function (response) {

      // Login was not successful, call error callback and pass error
      if(errorCallback) { errorCallback(response); }
      throw response;

    });
  }

  // Send authenticaiton request with FB token
  function authFb(response) {
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

      // Create User Scope
      var user = new EVT.User({
        id: access.evrythngUser,
        apiKey: access.evrythngApiKey
      }, $this);

      // Prepare resolve object. Move facebook user data
      // to 'user.facebook' object
      Utils.extend(user, { facebook: response.user }, true);
      response.user = user;

      return response;
    });
  }

  // Send authentication request using evrythng
  function _authEvrythng(credentials) {
    var $this = this;

    // Login with Evrythng, credentials contain user (id or email) and password
    return EVT.api({
      url: '/auth/evrythng',
      method: 'post',
      data: credentials,
      authorization: this.apiKey
    }).then(function (access) {

      return EVT.api({
        url: '/users/' + access.evrythngUser,
        authorization: $this.apiKey
      }).then(function (userInfo) {
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

  // Logout from Evrythng
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

  function _logoutFacebook(successCallback, errorCallback) {
    var $this = this;

    // Login using Facebook with options above
    return Facebook.logout().then(function () {

      // If successful, logout of Evrythng and resolve/reject promise
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

      if(errorCallback) { errorCallback(err); }
      throw err;
    });
  }


  return {
    login: login,
    logout: logout,
    authFb: authFb
  };
});