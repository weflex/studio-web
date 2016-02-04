"use strict";

var serve = require('serve-static');
var http = require('http');
var finalize = require('finalhandler');
var livereload = require('livereload');
var port = process.env.PORT || 8080;
var app = serve('./');

http.createServer(
  function (req, res, done) {
    var done = finalize(req, res);

    if (!/\.\w+(\?.*)?$/.test(req.url)) { // if url is not a file path

      if (/^\/login(\/.*)?/.test(req.url)) { // redirect to /login/index.html
        req.url = '/login/index.html';
      } else {
        req.url = '/index.html';
      }
    }
    app(req, res, done);
  }).listen(port);

var server = livereload.createServer();
server.watch('./');
