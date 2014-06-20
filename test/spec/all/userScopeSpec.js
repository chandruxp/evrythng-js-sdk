define([
  'scope/user',
  'scope/scope',
  'resource',
  'facebook',
  'scope/application'
], function (EVT, Scope, Resource, FB) {
  'use strict';

  describe('EVT.User', function () {
    var user,
      app,
      userObj = {
        id: "testuserid",
        apiKey: "apikey",
        firstName: 'EVT Test Name',
        email: 'foo@test.bar'
      };

    beforeEach(function () {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/applications')
        .andReturn(TestResponses.application.simple);

      app = new EVT.App('xxx');
    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
    });

    describe('Constructor', function () {

      it('should need parameter', function () {
        var badConstructor = function () {
          user = new EVT.User();
        };

        expect(badConstructor).toThrow();
      });

      it('should allow apiKey string', function () {
        user = new EVT.User('abc');

        expect(user.apiKey).toBe('abc');
      });

      it('should allow user data object', function () {
        user = new EVT.User(userObj);

        expect(user.apiKey).toBe('apikey');
        expect(user.id).toBe('testuserid');
        expect(user.email).toBe('foo@test.bar');
      });

      it('should inherit from Scope', function () {
        user = new EVT.User(userObj);

        expect(user instanceof Scope).toBeTruthy();
      });

      it('should allow to pass parentScope', function () {
        user = new EVT.User(userObj, app);

        expect(user.parentScope).toEqual(app);
      });

    });

    describe('logout', function () {

      beforeEach(function () {
        user = new EVT.User(userObj, app);
      });

      describe('with Facebook', function () {
        var fbLogout;

        beforeEach(function () {
          fbLogout = spyOn(FB, 'logout').and.callFake(function (callback) {
            callback(TestResponses.facebook.loginStatus.unknown);
          });
        });

        it('should logout with Facebook and Evrythng', function (done) {
          jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/all/logout')
            .andReturn(TestResponses.auth.logout);

          user.logout('facebook').then(function (response) {
            expect(fbLogout).toHaveBeenCalled();
            expect(response.logout).toBe("ok");
            done();
          });
        });

        it('should allow success callback', function (done) {
          var successCb = jasmine.createSpy('success');

          jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/all/logout')
            .andReturn(TestResponses.auth.logout);

          user.logout('facebook', successCb).then(function () {
            expect(successCb).toHaveBeenCalled();
            done();
          });
        });

        it('should allow error callback', function (done) {
          var errorCb = jasmine.createSpy('error');

          jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/all/logout')
            .andReturn(TestResponses.accessDenied);

          user.logout('facebook', null, errorCb).then(function () {
            expect(false).toBeTruthy();
            done();
          }, function () {
            expect(errorCb).toHaveBeenCalled();
            done();
          });
        });

      });

      describe('without Facebook', function () {

        it('should logout with Evrythng Engine', function () {
          user.logout();

          var request = jasmine.Ajax.requests.mostRecent();

          expect(request.url).toBe(EVT.settings.apiUrl + '/auth/all/logout');
          expect(request.requestHeaders.Authorization).toBe(user.apiKey);
        });

        it('should allow to call with type', function () {
          user.logout('evrythng');

          expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/auth/all/logout');
        });

        it('should allow success callback', function (done) {
          var successCb = jasmine.createSpy('success');

          jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/all/logout')
            .andReturn(TestResponses.auth.logout);

          user.logout(successCb).then(function (response) {
            expect(successCb).toHaveBeenCalled();
            expect(response.logout).toBe("ok");
            done();
          });
        });

        it('should allow error callback', function (done) {
          var errorCb = jasmine.createSpy('error');

          jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/auth/all/logout')
            .andReturn(TestResponses.accessDenied);

          user.logout(null, errorCb).then(function () {
            expect(false).toBeTruthy();
            done();
          }, function () {
            expect(errorCb).toHaveBeenCalled();
            done();
          });
        });

      });

    });

    describe('.thng()', function () {
      var thngResource;

      it('should create Resource for thng using EVT.Thng class', function () {
        thngResource = user.thng();

        expect(thngResource instanceof Resource).toBeTruthy();
        expect(thngResource.path).toBe('/thngs');
        expect(thngResource.class).toEqual(EVT.Thng);

        expect(thngResource.read).toBeDefined();
      });

      it('should allow single resource with provided ID', function () {
        thngResource = user.thng('123');

        expect(thngResource.path).toBe('/thngs/123');
      });

      it('should throw Error if ID is not String', function () {
        var badCall = function () {
          user.thng({});
        };

        expect(badCall).toThrow();
      });

      it('.read() without ID should handle list of thngs', function (done) {
        user.thng().read()
          .then(function (thngs) {
            expect(thngs.length).toBe(2);
            expect(thngs[0] instanceof EVT.Thng).toBeTruthy();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.all);
      });

      it('.read() with ID should handle single object', function (done) {
        user.thng('123').read()
          .then(function (thng) {
            expect(thng instanceof EVT.Thng).toBeTruthy();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.one);
      });

      it('should allow to update thng once its returned', function (done) {
        var thng123;
        user.thng('123').read()
          .then(function (thng) {
            thng123 = thng;

            expect(thng.description).toBeUndefined();
            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/thngs/123')
              .andReturn(TestResponses.thngs.updated);

            thng123.description = 'desc';
            return thng123.update();
          }).then(function (updated) {
            expect(updated.description).toBe('desc');
            expect(thng123.description).toBe('desc');
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.thngs.one);
      });

    });

    describe('.search()', function () {

      it('should allow single string param', function () {
        user.search('stuff');

        expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/search?q=stuff');
      });

      it('should allow string and options params', function () {
        user.search('stuff', {types: 'thng,product'});

        expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/search?q=stuff&types=thng%2Cproduct');
      });

      it('should allow two options params', function () {
        user.search({
          name: 'tv',
          description: 'plasma'
        }, {
          types: 'thng,product'
        });

        expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/search?name=tv&description=plasma&types=thng%2Cproduct');
      });

      it('should allow single options param', function () {
        user.search({
          name: 'tv',
          types: 'thng,product'
        });

        expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/search?name=tv&types=thng%2Cproduct');

      });

    });

    describe('.update()', function () {

      it('should update itself', function (done) {
        user.firstName = 'newName';
        user.update().then(function (updated) {
          expect(updated.firstName).toBe('newName');
          expect(user.firstName).toBe('newName');
          done();
        });

        var request = jasmine.Ajax.requests.mostRecent();

        expect(request.url).toBe(EVT.settings.apiUrl + '/users/testuserid');
        expect(request.method).toBe('put');

        request.response(TestResponses.users.updated);
      });

      it('should allow options', function (done) {
        user.update({
          firstName: 'newName'
        }).then(function (updated) {
          expect(updated.firstName).toBe('newName');
          expect(user.firstName).toBe('newName');
          done();
        });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.users.updated);
      });

    });

    describe('.collection()', function () {
      var collectionResource;

      it('should create Resource for collection using EVT.Collection class', function () {
        collectionResource = user.collection();

        expect(collectionResource instanceof Resource).toBeTruthy();
        expect(collectionResource.path).toBe('/collections');
        expect(collectionResource.class).toEqual(EVT.Collection);

        expect(collectionResource.read).toBeDefined();
      });

      it('should allow single resource with provided ID', function () {
        collectionResource = user.collection('stuff');

        expect(collectionResource.path).toBe('/collections/stuff');
      });

      it('should throw Error if ID is not String', function () {
        var badCall = function () {
          user.collection({});
        };

        expect(badCall).toThrow();
      });

      it('.read() without ID should handle list of collections', function (done) {
        user.collection().read()
          .then(function (collections) {
            expect(collections.length).toBe(2);
            expect(collections[0] instanceof EVT.Collection).toBeTruthy();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.collections.all);
      });

      it('.read() with ID should handle single object', function (done) {
        user.collection('123').read()
          .then(function (collection) {
            expect(collection instanceof EVT.Collection).toBeTruthy();
            done();
          }, function () {
            expect(false).toBeTruthy();
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.collections.one);
      });

      it('should allow to update thng once its returned', function (done) {
        var collection123;
        user.collection('123').read()
          .then(function (collection) {
            collection123 = collection;

            expect(collection.description).toBeUndefined();
            jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/collections/123')
              .andReturn(TestResponses.collections.updated);

            collection123.description = 'desc';
            return collection123.update();
          }).then(function (updated) {
            expect(updated.description).toBe('desc');
            expect(collection123.description).toBe('desc');
            done();
          });

        jasmine.Ajax.requests.mostRecent().response(TestResponses.collections.one);
      });

      it('should throw error trying to get thngs of an shallow Collection', function () {
        var badCall = function () {
          var collection = new EVT.Collection();
          collection.thng().read();
        };

        expect(badCall).toThrow();
      });

      describe('.thng()', function () {

        it('should get thngs for a specific collection', function (done) {
          user.collection('123').read().then(function (collection) {
            collection.thng().read();

            expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/collections/123/thngs');
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.collections.one);
        });

        it('should get specific thng in a collection', function (done) {
          user.collection('123').read().then(function (collection) {
            collection.thng('123').read();

            expect(jasmine.Ajax.requests.mostRecent().url).toBe(EVT.settings.apiUrl + '/collections/123/thngs/123');
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.collections.one);
        });

        it('should throw error if thng id is not string', function (done) {
          user.collection('123').read().then(function (collection) {

            var badCall = function () {
              collection.thng({}).read();
            };

            expect(badCall).toThrow();
            done();
          });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.collections.one);
        });

      });

    });

  });
});