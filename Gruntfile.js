'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var banner = '// EVRYTHNG JS SDK v<%= pkg.version %>\n' +
    '\n' +
    '// (c) 2012-<%= grunt.template.today("yyyy") %> EVRYTHNG Ltd. London / New York / Zurich.\n' +
    '// Released under the Apache Software License, Version 2.0.\n' +
    '// For all details and usage:\n' +
    '// https://github.com/evrythng/evrythng-js-sdk.\n' +
    '\n';


  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {
      dist: ['dist'],
      build: ['dist/build.txt', 'dist/versioned']
    },

    // Update version in Core
    version: {
      defaults: {
        src: ['src/core.js', 'bower.json']
      }
    },

    // build evrythng.js files from RequireJS modules
    requirejs: {
      compile: {
        options: {
          appDir: "src",
          baseUrl: ".",
          dir: "dist",
          modules: [
            {
              name: 'evrythng',
              include: ["almond","rsvp"]
            }
          ],
          paths: {
            rsvp: "../lib/rsvp",
            almond: "../tools/almond"
          },
          wrap: {
            "start": banner + grunt.file.read("tools/wrap.start.js"),
            "endFile": "tools/wrap.end.js"
          },
          removeCombined: true,
          // don't optimize now.. we'll do it after with uglify
          optimize: "none",
          normalizeDirDefines: "all"
        }
      }
    },

    // Create the anotated source code
    groc: {
      javascript: [
        "src/**/*.js"
      ],
      options: {
        //out: "docs/",
        github: true,
        'repository-url': '<%= pkg.repository.url %>',
        index: 'src/evrythng.js'
      }
    },

    // Minimize the file and create source maps
    uglify: {
      options: {
        sourceMap: true,
        report: 'gzip'
      },
      dist: {
        files: {
          'dist/evrythng.min.js': ["dist/evrythng.js"]
        }
      }
    },

    karma: {
      unit: {
        options: {
          configFile: 'karma.conf.js',
          singleRun: true
        }
      },
      dist: {
        options:{
          configFile: 'karma.conf-dist.js'
        },
        browserAMD:{
          // configFile is already prepared for AMD
        },
        browserGlobals: {
          frameworks: ['jasmine'],
          files: [
            'dist/*.min.js',
            'test/*DistSpec.js'
          ]
        }
      },
      sauce: {
        options: {
          configFile: 'karma.conf-sauce.js'
        }
      }
    },

    jasmine_node: {
      options: {
        specNameMatcher: 'DistSpec'
      },
      all: ['test/']
    },

    jshint: {
      files: ['src/**/*.js', 'test/**/*Spec.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Copy last release as scanthng.js (aka "latest", aka "current")
    copy: {
      dist: {
        files: [{
          src: 'dist/evrythng.js',
          dest: 'dist/versioned/evrythng-<%= pkg.version %>.js'
        },{
          src: 'dist/evrythng.min.js',
          dest: 'dist/versioned/evrythng-<%= pkg.version %>.min.js'
        },{
          src: 'dist/evrythng.min.map',
          dest: 'dist/versioned/evrythng-<%= pkg.version %>.min.map'
        }]
      }
    },

    //Git tag current commit
    gittag: {
      task: {
        options: {
          tag: 'v<%= pkg.version %>'
        }
      }
    },

    // Creates the gitpush task and ensures that the --tags flag is included
    // so that any tag is also pushed to the remote
    gitpush: {
      task: {
        options: {
          tags: true
        }
      }
    },

    // Check repo is clean and it is tagged and tag matches package version number
    checkrepo: {
      tag: {
        clean: true         // Check repo is clean
      },
      deploy: {
        clean: true,        // Check repo is clean
        tagged: true,       // Checks whether the last commit (HEAD) is tagged.
        tag: {
          eq: '<%= pkg.version %>',    // Check if highest repo tag is equal to pkg.version
          valid: '<%= pkg.version %>'  // Check if pkg.version is valid semantic version
        }
      }
    },


    aws_s3: {
      options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY
      },
      dev: {
        options: {
          bucket: process.env.AWS_EVTJS_DEV_BUCKET,
          debug: true
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '*',
          dest: 'libs/evrythngjs',
          filter: 'isFile'
        }]
      },
      release: {
        options: {
          bucket: process.env.AWS_EVTJS_RELEASE_BUCKET,
          // Debug option is for testing purposes
          debug: true,
          params: {
            ContentEncoding: 'gzip' // applies to all the files!
          }
        },
        files: [{
          expand: true,
          cwd: 'dist',
          src: '*',
          dest: 'libs/evrythngjs',
          filter: 'isFile'
        },{
          expand: true,
          cwd: 'dist/versioned',
          src: ['*'],
          dest: 'libs/evrythngjs',
          filter: 'isFile'
        }]
      }
    }
  });

  grunt.registerTask('test', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'karma:dist:browserAMD',
        'karma:dist:browserGlobals',
        'jasmine_node'
      ]);
    } else if (target === 'sauce') {
      return grunt.task.run(['karma:sauce']);
    }

    grunt.task.run(['karma:unit']);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'jshint',
    'test',
    'version',
    'groc',
    'requirejs',
    'uglify',
    'test:dist',
    'clean:build'
  ]);

  grunt.registerTask('deploy', function (target) {
    if (target === 'release') {
      return grunt.task.run([
        'build',
        'checkrepo:tag',
        'gittag',
        'checkrepo:deploy',
        'copy:dist',
        'aws_s3:release',
        'clean:build',
        'gitpush'
      ]);
    }

    grunt.task.run([
      'build',
      'aws_s3:dev'
    ]);
  });
};
