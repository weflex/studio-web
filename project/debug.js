var llport = 35728; // livereload listen port

module.exports = {

  /* Example of specifying build targets:
   *  debug[:default] and debug:serve
   */

  "serve": [
    "clean",
    "copy",
    "injector",
    "wiredep",
    "autoprefixer",
    "connect",
    "watch"
  ],

  "default": [
    "clean",
    "copy",
    "injector",
    "wiredep",
    "autoprefixer",
    "connect",
    "watch"
  ],

  "build": [
    "clean",
    "copy",
    "injector",
    "wiredep",
    "autoprefixer"
  ],

  "newer": [
    "copy",
    "injector",
    "wiredep",
    "autoprefixer"
  ],

  "tasks": {

    "clean": {
      "tmp": ".tmp"
    },

    "copy":{
      "styles": {
        "cwd":    "app/styles",
        "expand": true,
        "src":    "*.css",
        "dest":   ".tmp/styles/"
      },
      "images": {
        "cwd":    "app/images",
        "expand": true,
        "src":    "**/*.{png,jpg,jpeg,gif}",
        "dest":   ".tmp/images/"
      },
      "views": {
        "cwd":    "app/views",
        "expand": true,
        "src":    "**/*.html",
        "dest":   ".tmp/views/"
      },
      "scripts": {
        "cwd":    "app/scripts",
        "expand": true,
        "src":    "**/*.js",
        "dest":   ".tmp/scripts/"
      },
      "index": {
        "src":  ["app/index.html"],
        "dest": ".tmp/index.html"
      }
    },

    "autoprefixer": {
      "options": {
        "browsers": ["last 2 versions"]
      },
      "styles": {
          "cwd":    ".tmp/styles",
          "expand": true,
          "src":    "**/*.css",
          "dest":   ".tmp/styles"
      }
    },

    "injector": {
      "options": {
        "relative": true,
        "addRootSlash": false,
        "sort": function (a, b) {
          if (/.*\/module.js/.test(a) || /.*\/app.js/.test(a)) {
            return -1;
          }
          if (/.*\/module.js/.test(b) || /.*\/app.js/.test(b)) {
            return 1;
          }
          return 0;
        }
      },
      "scripts": {
        "files": {
          ".tmp/index.html": ".tmp/scripts/**/*.js"
        }
      },
      "styles": {
        "files": {
          ".tmp/index.html": ".tmp/styles/**/*.css"
        }
      }
    },

    "wiredep": {
      "app": {
        "src": [".tmp/index.html"],
        "ignorePath": /\.\.\//
      }
    },

    "connect": {
      "options": {
        "port": 9001,
        "hostname": "0.0.0.0",
        "livereload": llport
      },
      "livereload": {
        "options": {
          "open": true,
          "middleware": function (connect, options) {
            var rewrite = require('connect-modrewrite');
            return [
              connect().use(
                "/bower_components",
                connect.static("./bower_components")
              ),
              rewrite(["!^\/(styles|scripts|views|images)(\/.)*  /"]),
              connect.static(".tmp")
            ];
          }
        }
      }
    },

    "watch": {
      "options": {
        "livereload": llport
      },
      "bower": {
        "files": ["bower.json"],
        "tasks": ["wiredep"]
      },
      "views": {
        "files": ["app/**/*.html"],
        "tasks": ["debug:newer"]
      },
      "scripts": {
        "files": ["app/scripts/**/*.js"],
        "tasks": ["debug:newer"]
      },
      "styles": {
        "files": ["app/styles/**/*.css"],
        "tasks": ["debug:newer"],
        "options": {
          "livereload": llport
        }
      },
      "views": {
        "files": ["app/**/*.html"],
        "tasks": ["debug:newer"],
        "options": {
          "livereload": llport
        }
      },
      "livereload": {
        "files": [
          "app/views/*.html",
          ".tmp/index.html",
          ".tmp/scripts/**/*.js",
          ".tmp/styles/**/*.css"
        ]
      }
    }
  }
};
