define([
  'scope/scope'
], function (Scope) {
  'use strict';

  describe('Scope', function () {
    var apiKey = 'xxxxx';

    it('should need an API Key', function () {
      var badConstructor = function () {
        new Scope();
      };

      expect(badConstructor).toThrow();
    });

    it('should need a String API Key', function () {
      var badConstructor = function () {
        new Scope({
          apiKey: apiKey
        });
      };

      expect(badConstructor).toThrow();
    });

    it('should have api key stored', function(){
      var scope = new Scope(apiKey);

      expect(scope.apiKey).toBe(apiKey);
    });

    it('should not have a parent scope', function () {
      var scope = new Scope(apiKey);

      expect(scope.parentScope).toBeNull();
    });
  });
});
