define([
  'core',
  'entity/entity',
  'resource',
  'scope/application',
  'entity/product'
], function (EVT, Entity, Resource) {
  'use strict';

  describe('EVT Entity', function () {
    var entity;

    it('should allow empty constructor', function () {
      var emptyConstructor = function () {
        entity = new Entity();
      };

      expect(emptyConstructor).not.toThrow();
      expect(entity).toBeDefined();
      expect(entity.toJSON).toBeDefined();
      expect(entity.resource).toBeUndefined();
    });

    it('toJSON of empty should be empty object', function () {
      entity = new Entity();
      expect(entity.toJSON()).toEqual({});
    });

    it('should allow to add properties', function () {
      entity = new Entity();
      entity.foo = 'bar';

      expect(entity.foo).toBe('bar');
    });

    describe('with object constructor', function () {

      beforeEach(function () {
        entity = new Entity({
          test: 'a'
        });
      });

      it('should extend Entity properties', function () {
        expect(entity.test).toBe('a');
      });

      it('should allow to add and update properties', function () {
        entity.foo = 'bar';
        entity.test = 'b';

        expect(entity.foo).toBe('bar');
        expect(entity.test).toBe('b');
      });

      it('toJSON should return raw updated properties', function () {
        entity.foo = 'bar';
        entity.test = 'b';

        var json = entity.toJSON();

        expect(json.test).toBe('b');
        expect(json.foo).toBe('bar');
      });

      it('should throw error on REST methods without resource', function () {
        var badUpdate = function () {
          entity.update();
        };

        var badDelete = function () {
          entity.delete();
        };

        expect(badUpdate).toThrow(new Error('This entity has no resource'));
        expect(badDelete).toThrow(new Error('This entity has no resource'));
      });

    });

    describe('with resource constructor', function () {
      var app, productResource,
        path = '/products';

      beforeEach(function () {
        jasmine.Ajax.install();

        jasmine.Ajax.stubRequest(EVT.settings.apiUrl + '/aplications/me')
          .andReturn(TestResponses.application.simple);

        app = new EVT.App('xxx');
        productResource = new Resource(app, path, EVT.Product);
      });

      afterEach(function () {
        jasmine.Ajax.uninstall();
      });

      it('should allow resource on first parameter without object', function () {
        entity = new Entity(productResource);

        expect(entity.resource).toBe(productResource);
      });

      it('should allow object and resource constructor', function () {
        entity = new Entity({
          foo: 'bar'
        }, productResource);

        expect(entity.resource).toBeDefined();
        expect(entity.foo).toBe('bar');
      });

      describe('REST methods', function () {
        var successCb = jasmine.createSpy('success'),
          errorCb = jasmine.createSpy('error');

        beforeEach(function () {
          jasmine.Ajax.install();

          entity = new Entity({ foo: 'bar' }, productResource);
        });

        afterEach(function () {
          jasmine.Ajax.uninstall();
        });

        describe('.update()', function () {

          it('should send PUT request with updated payload', function () {
            entity.foo = 'foobar';
            entity.update();

            expect(jasmine.Ajax.requests.mostRecent().method).toBe('put');
            expect(jasmine.Ajax.requests.mostRecent().params).toBe('{"foo":"foobar"}');
          });

        });

        it('should allow object and callbacks', function (done) {
          entity.update(JSON.parse(TestResponses.products.one.responseText), successCb, errorCb)
            .then(function () {
              expect(successCb).toHaveBeenCalled();
              done();
            }, function () {
              expect(false).toBeTruthy();
              done();
            });

          var request = jasmine.Ajax.requests.mostRecent();

          expect(request.method).toBe('put');
          expect(request.params).toBe('{"id":"1","name":"qwer"}');

          jasmine.Ajax.requests.mostRecent().response(TestResponses.products.one);
        });

        it('should allow only callbacks', function (done) {
          entity.update(successCb, errorCb)
            .then(function () {
              expect(false).toBeTruthy();
              done();
            }, function () {
              expect(errorCb).toHaveBeenCalled();
              done();
            });

          jasmine.Ajax.requests.mostRecent().response(TestResponses.accessDenied);
        });

        it('.delete() should send DELETE request', function () {
          entity.delete();

          expect(jasmine.Ajax.requests.mostRecent().method).toBe('delete');
        });

      });

    });

  });

});