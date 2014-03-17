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
                '<%= yeoman.app %>/{,*/}*.js',
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
        uglify: {
            options: {
                banner: '/*!\n' +
                        ' * Client-side Javascript library to use the ScanThng Service\n' +
                        ' *\n' +
                        ' * Copyright [<%= grunt.template.today("yyyy") %>] [EVRYTHNG Ltd. London / Zurich]\n' +
                        ' *\n' +
                        ' * <%= pkg.name %> - v<%= pkg.version %> -\n' +
                        ' * All rights reserved\n' +
                        ' */\n' +
                        '\n'
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.dist %>/concatenated',
                    dest: '<%= yeoman.dist %>/minified',
                    src: ['**/*.js']
                }]
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['<%= yeoman.app %>/{,*/}*.js'],
                dest: '<%= yeoman.dist %>/concatenated/scanThng_<%= pkg.version %>.js'
            }
        },

        // Copy last release as scanThng.js (aka "latest", aka "current")
        copy: {
            dist: {
                files: [{
                    src: '<%= yeoman.dist %>/minified/scanThng_<%= pkg.version %>.js',
                    dest: '<%= yeoman.dist %>/minified/scanThng.js'
                }]
            },
        },

        aws_s3: {
            options: {
                accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
            },
            production: {
                options: {
                    bucket: 'scanthngjs-dev',
                },
                files: [
                    {expand: true, cwd: '<%= yeoman.dist %>/minified', src: ['**'], dest: '', filter: 'isFile'},
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
        'copy:dist',
        'aws_s3'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
