module.exports = {

  "default": [
    "clean",
    "bower_concat",
    "concat",
    "autoprefixer",
    "cssmin",
    "uglify",
    "copy",
    "injector"
  ],

  "tasks": {

    "clean": {
      "tmp": ".tmp",
      "out": "out"
    },

    "jshint": {
      "options": {
        "jshintrc": ".jshintrc",
        "reporter": require("jshint-stylish")
      },
      "all": {
        "src": ["app/scripts/**/*.js"]
      }
    },

    "copy":{
      "styles": {
        "cwd":    ".tmp/styles",
        "expand": true,
        "src":    "**/*.min.css",
        "dest":   "out/styles/"
      },
      "markdown-editor": {
        "cwd": "bower_components/markdown-editor-flavored",
        "expand": true,
        "src": "markdown-editor.css",
        "dest": "out/styles/"
      },
      "scripts": {
        "cwd":    ".tmp/scripts",
        "expand": true,
        "src":    "**/*.min.js",
        "dest":   "out/scripts/"
      },
      "images": {
        "cwd":    "app/images",
        "expand": true,
        "src":    "**/*.{png,jpg,jpeg,gif}",
        "dest":   "out/images/"
      },
      "views": {
        "cwd":    "app/views",
        "expand": true,
        "src":    "**/*.html",
        "dest":   "out/views/"
      },
      "fonts": {
        "cwd": "app/fonts",
        "expand": true,
        "src": "**/*",
        "dest": "out/fonts/"
      },
      "index": {
        "src":  "app/index.html",
        "dest": "out/index.html"
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
        "addRootSlash": false
      },
      "scripts": {
        "files": {
          "out/index.html": "out/scripts/**/*.js"
        }
      },
      "styles": {
        "files": {
          "out/index.html": ["out/styles/**/*.css", "!out/styles/markdown-editor.css"]
        }
      }
    },

    "uglify": {
      "scripts": {
        "files": {
          ".tmp/scripts/main.min.js": ".tmp/scripts/main.js",
          ".tmp/scripts/bower_components.min.js": ".tmp/scripts/bower_components.js"
        }
      }
    },

    "cssmin": {
      "styles": {
        "files": [{
          "expand": true,
          "cwd":    "app/styles",
          "src":    "**/*.css",
          "dest":   ".tmp/styles/",
          "ext":    ".min.css"
        }]
      },
      "bower": {
        "files": [{
          "expand": true,
          "cwd":    ".tmp/styles",
          "src":    "**/*.css",
          "dest":   ".tmp/styles/",
          "ext":    ".min.css"
        }]
      }
    },

    "concat": {
      "options": {
        "separator": ";"
      },
      "styles": {
        "src":  "app/styles/**/*.css",
        "dest": ".tmp/styles/main.css"
      },
      "scripts": {
        "src":  ["app/config/prod.js",
                 "app/scripts/**/*.js",
                 "!app/scripts/libs/*.js"],
        "dest": ".tmp/scripts/main.js"
      },
      "moment": {
        "src": [".tmp/scripts/bower_components.js",
                "bower_components/moment/locale/zh-cn.js"],
        "dest": ".tmp/scripts/bower_components.js"
      }
    },

    "bower_concat": {
      "options": {
        "separator": ";"
      },
      "bower": {
        "dest": ".tmp/scripts/bower_components.js",
        "cssDest": ".tmp/styles/bower_components.css"
      }
    }
  }
};
