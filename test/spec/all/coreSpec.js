define(['core'], function (EVT) {
  'use strict';

  describe('EVT Core', function() {

    it('should have the version defined', function () {
      expect(EVT.version).toBeDefined();
    });

    it('should have default settings', function () {
      expect(Object.keys(EVT.settings).length > 0).toBe(true);
    });

    describe('Setup', function () {

      afterEach(function () {
        EVT.setup({
          apiUrl: 'https://api.evrythng.com',
          async: true,
          fullResponse: false,
          fetchCascade: false,
          onStartRequest: null,
          onFinishRequest: null,
          geolocation: true
        });
      });

      it('should allow to change settings', function () {
        expect(EVT.setup).toBeDefined();
      });

      it('should only accept object', function () {
        var badSetup = function () {
          EVT.setup('xxx');
        };

        expect(badSetup).toThrow();
      });

      it('should allow to change API URL', function () {
        var customApiUrl = 'xxx';
        EVT.setup({ apiUrl: customApiUrl});

        expect(EVT.settings.apiUrl).toBe(customApiUrl);
      });

      it('should merge options', function () {
        var options = {
          apiUrl: 'xxx',
          async: false
        };
        EVT.setup(options);

        expect(EVT.settings.apiUrl).toBe(options.apiUrl);
        expect(EVT.settings.async).toBe(options.async);
        // TODO: uncomment when option is available
        //expect(EVT.settings.geolocation).toBe(true);
      });
    });
  });

});