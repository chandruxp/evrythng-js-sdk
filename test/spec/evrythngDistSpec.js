(function (root, factory) {
  "use strict";

  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['evrythng'], factory);

  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    factory(require('../../dist/evrythng'));

  } else {
    // Browser globals
    factory(root.EVT);
  }
}(this, function factory(EVT) {
  "use strict";

  describe('EVT Distribution', function () {

    it('should exist', function () {
      expect(EVT).toBeDefined();
    });

    it('should allow Setup', function () {
      EVT.setup({
        apiUrl: 'http://api-test.evrythng.net'
      });

      expect(EVT.settings.apiUrl).toBe('http://api-test.evrythng.net');
    });

    it('should allow raw .api() call', function (done) {
      EVT.api({
        url: '/products',
        authorization: 'randomApiAccessKey'
      }).then(function () {
        expect(false).toBeTruthy();
        done();
      }, function (err) {
        expect(err.status).toBe(403);
        done();
      });
    });

  });

}));