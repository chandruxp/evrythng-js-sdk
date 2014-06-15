// Karma configuration
// Generated on Mon Mar 31 2014 22:45:40 GMT+0100 (BST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'test/test-main.js',
      {pattern: 'lib/**/*.js', included: false},
      {pattern: 'src/**/*.js', included: false},
      {pattern: 'test/spec/all/**/*.js', included: false},
      {pattern: 'test/mock/**/*.js', included: false},
      {pattern: 'test/helpers/**/*.js', included: false}
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'html', 'coverage'],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/src/**/*.js': 'coverage'
    },


    // use type=cobertura for (xml format supported by Jenkins)
    coverageReporter: {
      reporters:[
        { type: 'html', dir: 'test/results/coverage' },
        { type: 'cobertura', dir: 'test/results/coverage' }
      ]
    },

    // pretty HTML output for Karma - Jasmine template
    htmlReporter: {
      outputDir: 'test/results/karma',
      templatePath: 'test/jasmine_template.html'
    },


    // list of files / patterns to exclude
    exclude: [],


    // web server port
    port: 8080,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
