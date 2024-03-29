var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file) || /mock\//.test(file) || /helpers\//.test(file)) {
      tests.push(file);
    }
  }
}

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/src',

  paths: {
    npo: '../lib/npo',
    facebook: '//connect.facebook.net/en_US/all'
  },

  shim: {
    facebook: {
      exports: 'FB'
    }
  },

  // dynamically load all test files
  deps: tests,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
