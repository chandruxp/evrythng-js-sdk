define([
  'scope/application',
  'scope/scope',
  'resource',
  'facebook',
  'scope/user'
], function (EVT, Scope, Resource, FB) {
  'use strict';

  describe('EVT.App', function () {
    var appApiKey = '12345',
      app;

    beforeEach(function () {
      jasmine.Ajax.install();

      app = new EVT.App(appApiKey);
    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
    });

    describe('Constructor', function () {

      it('should inherit from Scope', function () {
        expect(app instanceof Scope).toBeTruthy();
        expect(app.apiKey).toBe(appApiKey);
      });

      it('should keep constructor promise', function () {
        expect(app.$init).toBeDefined();
      });

      it('should resolve constructor promise with itself', function (done) {
        app.$init.then(function (appInfo) {
          expect(appInfo.id).toBe(app.id);
          expect(app.name).toBe('abc');
          expect(app.id).toBe('app2');
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.application.simple);
      });


      it('should log error if API Key does not exist', function (done) {
        console.error = jasmine.createSpy('error');

        app = new EVT.App('sshah');

        app.$init.then(function () {
          expect(console.error).toHaveBeenCalled();
          expect(app.name).not.toBeDefined();
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.application.nonExistent);
      });

      it('should allow apiKey in options', function () {
        app = new EVT.App({
          apiKey: appApiKey
        });

        expect(app.apiKey).toBe(appApiKey);
      });

      it('should allow apiKey string and options object', function () {
        app = new EVT.App(appApiKey, {});

        expect(app.apiKey).toBe(appApiKey);
      });

      describe('with Facebook', function () {
        var fbInit;

        beforeEach(function () {
          spyOn(FB, 'api').and.callFake(function (path, callback) {
            callback(TestResponses.facebook.me);
          });

          fbInit = spyOn(FB, 'init');

          app = new EVT.App({
            apiKey: appApiKey,
            facebook: true
          });

          setTimeout(function () {
            window.fbAsyncInit();
          }, 100);
        });

        describe('without logged user', function () {

          beforeEach(function () {
            spyOn(FB, 'getLoginStatus').and.callFake(function (callback) {
              callback(TestResponses.facebook.loginStatus.unknown);
            });
          });

          it('should init facebook if app uses Facebook', function (done) {
            app.$init.then(function () {
              expect(fbInit).toHaveBeenCalled();
              done();
            });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.application.withFacebook);
          });

          it('should still get updated app scope', function (done) {
            app.$init.then(function (response) {
              expect(response.app instanceof EVT.App).toBeTruthy();
              expect(response.app.id).toBe('app1');
              done();
            });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.application.withFacebook);
          });

          it('should return logged status but not user', function (done) {
            app.$init.then(function (response) {
              expect(response.status).toBeDefined();
              expect(response.status).toBe('unknown');
              expect(response.user).not.toBeDefined();
              done();
            });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.application.withFacebook);
          });

        });

        describe('with logged user', function () {

          beforeEach(function () {
            spyOn(FB, 'getLoginStatus').and.callFake(function (callback) {
              callback(TestResponses.facebook.loginStatus.connected);
            });
          });

          it('should return user scope with facebook user information', function (done) {
            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/facebook')
              .andReturn(TestResponses.auth.facebook);

            app.$init.then(function (response) {
              expect(response.user).toBeDefined();
              expect(response.user instanceof EVT.User).toBeTruthy();
              expect(response.user.id).toBe('testuserid');
              expect(response.user.facebook.id).toBe('fb1234');
              expect(response.app).toBeDefined();
              done();
            });

            jasmine.Ajax.requests.mostRecent().response(TestResponses.application.withFacebook);
          });

        });

      });

    });

    describe('.product()', function () {
      var productResource;

      it('should create Resource for products using EVT.Product class', function () {
        productResource = app.product();

        expect(productResource instanceof Resource).toBeTruthy();
        expect(productResource.path).toBe('/products');
        expect(productResource.class).toEqual(EVT.Product);

        expect(productResource.read).toBeDefined();
      });

      it('should allow single resource with provided ID', function () {
        productResource = app.product('123');

        expect(productResource.path).toBe('/products/123');
      });

      it('should throw Error if ID is not String', function () {
        var badCall = function () {
          app.product({});
        };

        expect(badCall).toThrow();
      });

      it('.read() without ID should handle list of products', function (done) {
        app.product().read()
          .then(function (products) {
            expect(products.length).toBe(2);
            expect(products[0] instanceof EVT.Product).toBeTruthy();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.products.all);
      });

      it('.read() with ID should handle single object', function (done) {
        app.product('123').read()
          .then(function (product) {
            expect(product instanceof EVT.Product).toBeTruthy();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
      });

      it('should allow to update product once its returned', function (done) {
        var prod1;
        app.product('1').read()
          .then(function (product) {
            prod1 = product;

            expect(product.description).toBeUndefined();
            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/products/1')
              .andReturn(TestResponses.products.updated);

            prod1.description = 'desc';
            return prod1.update();
          }).then(function (updated) {
            expect(updated.description).toBe('desc');
            expect(prod1.description).toBe('desc');
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
      });

      it('should allow to update a product in a list', function (done) {
        var prod1;
        app.product('1').read()
          .then(function (products) {
            prod1 = products[0];

            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/products/1')
              .andReturn(TestResponses.products.updated);

            prod1.description = 'desc';
            return prod1.update();
          }).then(function (updated) {
            expect(updated.description).toBe('desc');
            expect(prod1.description).toBe('desc');
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.products.all);
      });

    });

    describe('.action()', function () {

      beforeEach(function () {
        EVT.setup({ geolocation: false });
      });

      afterEach(function () {
        EVT.setup({ geolocation: true });
      });

      describe('.read()', function () {

        it('without ID should handle list of actions', function (done) {
          app.action('scans').read().then(function (scans) {
            expect(scans.length).toBe(2);
            expect(scans[0].customFields.foo).toBe("bar");
            expect(scans[1].user).toBe("000");
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.all);
        });

        it('with ID should handle single object', function (done) {
          app.action('scans', '2134').read()
            .then(function (action) {
              expect(action instanceof EVT.Action).toBeTruthy();
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.one);
        });

      });

      describe('.create()', function () {

        it('should send thng ID', function (done) {
          app.action('scans').create()
            .then(function (action) {
              expect(action instanceof EVT.Action).toBeTruthy();
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

          var request = jasmine.Ajax.requests.mostRecent();

          expect(request.data().thng).toBeUndefined();
          expect(request.data().product).toBeUndefined();
          jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.one);
        });

      });

    });

    describe('.appUser()', function () {
      var userResource;

      it('should create Resource for products using EVT.Product class', function () {
        userResource = app.appUser();

        expect(userResource instanceof Resource).toBeTruthy();
        expect(userResource.path).toBe('/auth/evrythng/users');
        expect(userResource.class).toEqual(EVT.AppUser);

        expect(userResource.read).toBeDefined();
      });

      it('should allow single resource with provided ID', function () {
        userResource = app.appUser('123');

        expect(userResource.path).toBe('/auth/evrythng/users/123');
      });

      it('should throw Error if ID is not String', function () {
        var badCall = function () {
          app.appUser({});
        };

        expect(badCall).toThrow();
      });

      it('should be able to create user', function (done) {
        app.appUser().create({
          email: 'foo@test.bar',
          firstName: 'EVT',
          lastName: 'Evrythng',
          password: 'testpass'
        }).then(function (authResponse) {
          expect(authResponse.activationCode).toBeDefined();
          expect(authResponse.status).toBe('inactive');
          done();
        });

        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(EVT.settings.apiUrl + '/auth/evrythng/users');
        expect(request.requestHeaders.Authorization).toBe(app.apiKey);

        request.response(TestResponses.auth.create);
      });

      it('should be able to create and validate user in sigle request', function (done) {
        jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/evrythng/users')
          .andReturn(TestResponses.auth.create);

        jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/evrythng/users/123/validate')
          .andReturn(TestResponses.auth.validate);

        app.appUser().create({
          email: 'foo@test.bar',
          firstName: 'EVT',
          lastName: 'Evrythng',
          password: 'testpass'
        }).then(function (authResponse) {
          return authResponse.validate();
        }).then(function (response) {
          expect(response.status).toBe('active');
          done();
        });
      });

      describe('.validate()', function () {

        it('should need a string activation code', function () {
          var badCall = function () {
            app.appUser('123').validate();
          };

          expect(badCall).toThrow();
        });

        it('should call validate to Evrtyhng', function () {
          app.appUser('123').validate('abc');

          var request = jasmine.Ajax.requests.mostRecent();
          expect(request.url).toBe(EVT.settings.apiUrl + '/auth/evrythng/users/123/validate');
          expect(request.requestHeaders.Authorization).toBe(app.apiKey);
        });

      });

    });

    describe('.login()', function () {

      it('should need parameters', function () {
        var badCall = function () {
          app.login();
        };

        expect(badCall).toThrow();
      });

      describe('Facebook', function () {

        beforeEach(function () {
          spyOn(FB, 'api').and.callFake(function (path, callback) {
            callback(TestResponses.facebook.me);
          });

          spyOn(FB, 'init');

          app = new EVT.App(appApiKey, { facebook: true });
        });

        it('should use default permissions if none is given', function (done) {
          spyOn(FB, 'login').and.callFake(function (callback, options) {
            expect(options).toEqual({ scope: 'email'});
            done();
          });

          app.login('facebook');
        });

        it('should override options', function (done) {
          spyOn(FB, 'login').and.callFake(function (callback, options) {
            expect(options).toEqual({ scope: 'email,user_birthday' });
            done();
          });

          app.login('facebook', { scope: 'email,user_birthday' });
        });

        describe('on success', function () {

          beforeEach(function () {
            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/facebook')
              .andReturn(TestResponses.auth.facebook);

            spyOn(FB, 'login').and.callFake(function (callback) {
              callback(TestResponses.facebook.loginStatus.connected);
            });
          });

          it('should return connection status and user scope', function (done) {
            app.login('facebook').then(function (response) {
              expect(response.status).toBe('connected');
              expect(response.user).toBeDefined();
              expect(response.user instanceof EVT.User).toBeTruthy();
              done();
            });
          });

          it('should allow success callback with status and user scope', function (done) {
            var successCb = jasmine.createSpy('success');

            app.login('facebook', successCb).then(function (response) {
              expect(successCb).toHaveBeenCalled();
              expect(response.status).toBe('connected');
              expect(response.user).toBeDefined();
              expect(response.user instanceof EVT.User).toBeTruthy();
              done();
            });
          });

        });

        describe('on failure', function () {

          beforeEach(function () {
            spyOn(FB, 'login').and.callFake(function (callback) {
              callback(TestResponses.facebook.loginStatus.unknown);
            });
          });

          it('should allow error callback with status', function (done) {
            var errorCb = jasmine.createSpy('error');

            app.login('facebook', null, errorCb).then(function () {
              expect(false).toBeTruthy();
              done();
            }, function (response) {
              expect(errorCb).toHaveBeenCalled();
              expect(response.status).toBe('unknown');
              done();
            });
          });

        });

      });

      describe('Evrythng', function () {

        it('should call Evrythng Authentication', function () {
          app.login({
            email: 'abc',
            password: 'pass'
          });

          var request = jasmine.Ajax.requests.mostRecent();

          expect(request.url).toBe(EVT.settings.apiUrl + '/auth/evrythng');
          expect(request.method).toBe('post');
          expect(request.requestHeaders.Authorization).toBe(app.apiKey);
          expect(request.params).toBe('{"email":"abc","password":"pass"}');
        });

        it('should need credentials', function () {
          var badCall = function () {
            app.login(function () {});
          };

          expect(badCall).toThrow();
        });

        it('should allow to pass type', function () {
          app.login('evrythng', {
            email: 'abc',
            password: 'pass'
          });
          
          expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/auth/evrythng');
        });

        describe('on success', function () {

          beforeEach(function () {
            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/evrythng')
              .andReturn(TestResponses.auth.evrythng);

            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/users/testuserid')
              .andReturn(TestResponses.users.one);
          });

          it('should get user details from the engine', function (done) {
            app.login('evrythng', {
              email: 'abc',
              password: 'pass'
            }).then(function (response) {
              expect(response.user).toBeDefined();
              expect(response.user instanceof EVT.User).toBeTruthy();
              expect(response.user.id).toBe('testuserid');
              done();
            });
          });

          it('should allow success callback', function (done) {
            var successCb = jasmine.createSpy('success');

            app.login({
              email: 'abc',
              password: 'pass'
            }, successCb).then(function () {
              expect(successCb).toHaveBeenCalled();
              done();
            });
          });

        });

        describe('on failure', function () {

          beforeEach(function () {
            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/evrythng')
              .andReturn(TestResponses.accessDenied);
          });

          it('should allow error callback with error message', function (done) {
            var errorCb = jasmine.createSpy('error');

            app.login({
              email: 'abc',
              password: 'pass'
            }, null, errorCb).then(function () {
              expect(false).toBeTruthy();
              done();
            }, function (err) {
              expect(errorCb).toHaveBeenCalled();
              expect(err.errors).toBeDefined();
              done();
            });
          });

        });

      });

    });
  });

});
