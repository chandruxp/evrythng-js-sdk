// Generated on 2014-02-06 using generator-webapp 0.4.7
/*jshint camelcase: false*/
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {


    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        timestamp: Date.now() + '',

        // Read package.json
        pkg: grunt.file.readJSON('package.json'),

        // Project settings
        yeoman: {
            // Configurable paths
            app: 'src',
            dist: 'dist'
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: ['<%= yeoman.app %>/{,*/}*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            jstest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['test:watch']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            styles: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{gif,jpeg,jpg,png,svg,webp}'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>',
                    livereload: false
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                //TODO: Improve evrythng.js code so that we can use jshint on it
                '!<%= yeoman.app %>/{,*/}*.js',
                '!<%= yeoman.app %>/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        // Jasmine testing framework configuration options
        jasmine: {
            all: {
                src: ['src/vendor/*.js', 'src/*.js', 'src/bower_components/jquery/jquery.js'],
                options: {
                    summary: true,
                    display: 'short',
                    keepRunner: true,
                    specs: 'test/spec/*Spec.js',
                    helpers: ['test/*Helper.js', 'test/lib/*.js']
                }
            }
        },

        concat: {
            options: {
                separator: ';',
                banner: '/*!\n' +
                        ' * Client-side Javascript library to access Evrythng API v<%= pkg.version %>\n' +
                        ' * https://github.com/evrythng/evrythng-java-sdk\n' +
                        ' *\n' +
                        ' * Copyright [<%= grunt.template.today("yyyy") %>] [EVRYTHNG Ltd. London / Zurich]\n' +
                        ' *\n' +
                        ' * Released under the http://www.apache.org/licenses/LICENSE-2.0\n' +
                        ' * https://github.com/evrythng/evrythng-java-sdk/blob/master/LICENSE.txt\n' +
                        ' */\n' +
                        '\n'
            },
            dist: {
                src: ['<%= yeoman.app %>/{,*/}*.js'],
                dest: '<%= yeoman.dist %>/concatenated/evrythng-<%= pkg.version %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*!\n' +
                        ' * Client-side Javascript library to access Evrythng API v<%= pkg.version %>\n' +
                        ' * https://github.com/evrythng/evrythng-java-sdk\n' +
                        ' *\n' +
                        ' * Copyright [<%= grunt.template.today("yyyy") %>] [EVRYTHNG Ltd. London / Zurich]\n' +
                        ' *\n' +
                        ' * Released under the http://www.apache.org/licenses/LICENSE-2.0\n' +
                        ' * https://github.com/evrythng/evrythng-java-sdk/blob/master/LICENSE.txt\n' +
                        ' */\n' +
                        '\n'
            },
            dist: {
                files: {
                    '<%= yeoman.dist %>/minified/evrythng-<%= pkg.version %>.min.js': '<%= yeoman.dist %>/concatenated/evrythng-<%= pkg.version %>.js'
                }
            }
        },
        // Copy last release as evrythng.js (aka "latest", aka "current")
        copy: {
            dist: {
                files: [
                    {
                        src: '<%= yeoman.dist %>/minified/evrythng-<%= pkg.version %>.min.js',
                        dest: '<%= yeoman.dist %>/minified/evrythng.min.js'
                    },
                    {
                        src: '<%= yeoman.dist %>/concatenated/evrythng-<%= pkg.version %>.js',
                        dest: '<%= yeoman.dist %>/concatenated/evrythng.js'
                    }
                ]
            }

            // demo: {
            //     files: [
            //         {
            //             expand: true,
            //             flatten: true,
            //             filter: 'isFile',
            //             src: '<%= yeoman.dist %>/**',
            //             dest: '<%= yeoman.demo %>'
            //         }
            //     ]
            // }
        },

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

        checkrepo: {
            // Check repo is clean before tagging
            tag: {
                clean: true,        // Check repo is clean
            },
            // Check repo is tagged and tag matches package
            // version number before deploying
            deploy: {
                clean: true,        // Check repo is clean
                tagged: true,       // Checks whether the last commit (HEAD) is tagged.
                tag: {
                    eq: '<%= pkg.version %>',    // Check if highest repo tag is equal to pkg.version
                    valid: '<%= pkg.version %>', // Check if pkg.version is valid semantic version
                }
            }
        },

        // Read AWS environment variables (if available) into an object
        aws: {
            AWSAccessKeyId : process.env.AWS_ACCESS_KEY_ID,
            AWSSecretKey : process.env.AWS_SECRET_KEY,
            AWSProductionBucket: process.env.AWS_EVTHJS_PROD_BUCKET,
            AWSDemoBucket: process.env.AWS_EVTHJS_DEMO_BUCKET
        },

        // Deploy to AWS bucket
        aws_s3: {
            options: {
                accessKeyId: '<%= aws.AWSAccessKeyId %>',
                secretAccessKey: '<%= aws.AWSSecretKey %>'
            },
            demo: {
                options: {
                    bucket: '<%= aws.AWSDemoBucket %>',
                    // debug: true
                },
                files: [
                    {
                        src: '<%= yeoman.dist %>/concatenated/evrythng-<%= pkg.version %>.js',
                        dest: 'evrythng-<%= pkg.version %>-<%= timestamp %>.js'
                    },
                    {
                        src: '<%= yeoman.dist %>/minified/evrythng-<%= pkg.version %>.min.js',
                        dest: 'evrythng-<%= pkg.version %>-<%= timestamp %>.min.js'
                    }
                ]
            },
            production: {
                options: {
                    bucket: '<%= aws.AWSProductionBucket %>',
                    // Debug option is for testing purposes
                    // debug: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/concatenated',
                        src: ['**'],
                        dest: 'toolkit/evrythng-js-wrapper',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.dist %>/minified',
                        src: ['**'],
                        dest: 'toolkit/evrythng-js-wrapper',
                        filter: 'isFile'
                    }
                ]
            }
        },

        docco: {
            app: {
                src: ['<%= yeoman.app %>/{,*/}*.js']
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
            ],
            test: [
            ],
            dist: [
            ]
        }
    });


    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('test', function(target) {
        if (target !== 'watch') {
            grunt.task.run([
                'clean:server',
                'concurrent:test'
            ]);
        }

        grunt.task.run([
            'connect:test',
            'jasmine'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'concurrent:dist',
        'concat',
        'uglify',
        'copy:dist'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('tag', [
        'checkrepo:tag',
        'gittag'
    ]);

    grunt.registerTask('deploy', [
        'default',
        'tag',
        'checkrepo:deploy',
        'aws_s3:production',
        'gitpush'
    ]);

    grunt.registerTask('deploydemo', [
        'default',
        'aws_s3:demo'
    ]);
};
