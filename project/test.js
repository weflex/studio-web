module.exports = {
  "unit": [
    "karma"
  ],

  "default": [
    "wiredep",
    "karma"
  ],

  "tasks": {
    "wiredep": {
      "test": {
        "src": "test/karma.conf.js",
        "ignorePath": /\.\.\//,
        "devDependencies": true,
        "exclude": ["angular-scenario"],
        "fileTypes": {
          "js": {
            "block": /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
            "detect": {
              "js": /'(.*\.js)'/gi
            },
            "replace": {
              "js": '\'{{filePath}}\','
            }
          }
        }
      }
    },
    "karma": {
      "unit": {
        "configFile": "test/karma.conf.js",
        "singleRun": true
      }
    }
  }
};
