'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var debug    = require('./project/debug')
    , test     = require('./project/test')
    , snapshot = require('./project/snapshot');


  grunt.registerTask(
    "debug",
    function (target) {
      grunt.initConfig(debug.tasks);
      grunt.task.run(debug[(target || "default")]);
    });

  grunt.registerTask(
    "test",
    function (target) {
      grunt.initConfig(test.tasks);
      grunt.task.run(test[(target || "default")]);
    });

  grunt.registerTask(
    "snapshot",
    function (target) {
      grunt.initConfig(snapshot.tasks);
      grunt.task.run(snapshot[(target || "default")]);
    });

  grunt.registerTask("default", ["debug:serve"]);
};
