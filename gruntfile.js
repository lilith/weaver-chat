'use strict';

module.exports = function(grunt) {
  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        files: ['gruntfile.js', 'server.js', 'chat.js', 'public/weaverchat.js'],
        tasks: ['jshint'],
        options: {
          livereload: true,
        },
      },
      html: {
        files: ['public/**'],
        options: {
          livereload: true,
        },
      },
      css: {
        files: ['public/**'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: {
        src: ['gruntfile.js', 'server.js', 'chat.js', 'public/weaverchat.js'],
        options: {
          jshintrc: true
        }
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'web.js',
          args: [],
          ignoredFiles: ['public/**'],
          watchedExtensions: ['js'],
          nodeArgs: ['--debug'],
          delayTime: 1,
          env: {
            PORT: 80
          },
          cwd: __dirname
        }
      }
    },
    concurrent: {
      tasks: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    env: {
      test: {
        NODE_ENV: 'test'
      }
    }
  });

  //Load NPM tasks 
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-env');

  //Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  //Default task(s).
  grunt.registerTask('default', ['jshint', 'concurrent']);

  //Test task.
};