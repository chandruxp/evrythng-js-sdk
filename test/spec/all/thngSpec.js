define([
  'core',
  'entity/entity',
  'entity/thng',
  'entity/product',
  'entity/property',
  'resource',
  'scope/user'
], function (EVT, Entity, Thng, Product, Property, Resource) {
  'use strict';

  describe('EVT.Thng', function () {
    var user, thngResource, thng,
      path = '/thngs/123';

    beforeEach(function () {
      jasmine.Ajax.install();

      user = new EVT.User({
        id: "testuserid",
        apiKey: "apikey",
        firstName: 'EVT Test Name',
        email: 'foo@test.bar'
      });
      thngResource = new Resource(user, path, EVT.Thng);
      thng = new EVT.Thng({
        id: '123',
        name: 'foo',
        product: '1',
        properties: {
          foo: 'bar'
        }
      }, thngResource);
    });

    afterEach(function () {
      jasmine.Ajax.uninstall();
    });

    it('should inherit from Entity', function () {
      expect(thng instanceof Entity).toBeTruthy();
    });

    describe('.readProduct()', function () {

      it('should throw error if thng does not have a product', function () {
        thng = new EVT.Thng({
          id: '123',
          name: 'foo'
        }, thngResource);

        var badCall = function () {
          thng.readProduct();
        };

        expect(badCall).toThrow();
      });

      it('should throw error if thng does not have resource', function () {
        thng = new EVT.Thng({
          id: '123',
          product: '1'
        });

        var badCall = function () {
          thng.readProduct();
        };

        expect(badCall).toThrow();
      });

      it('should return thngs product', function (done) {
        thng.readProduct().then(function (prod) {
          expect(prod).toBeDefined();
          expect(prod instanceof EVT.Product).toBeTruthy();
          expect(prod.id).toBe('1');
          done();
        });

        var request = jasmine.Ajax.requests.mostRecent();

        expect(request.url).toBe(EVT.settings.apiUrl + '/products/1');
        expect(request.requestHeaders.Authorization).toBe(user.apiKey);

        request.response(TestResponses.products.one);
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
          thng.action('scans').read().then(function (scans) {
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
          thng.action('scans', '2134').read()
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
          thng.action('scans').create()
            .then(function (action) {
              expect(action instanceof EVT.Action).toBeTruthy();
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

          var request = jasmine.Ajax.requests.mostRecent();

          expect(request.data().thng).toBe('123');
          jasmine.Ajax.requests.mostRecent().response(TestResponses.actions.scans.one);
        });

      });

    });

  });

});