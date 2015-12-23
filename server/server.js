"use strict";

var serve = require('serve-static');
var http = require('http');
var finalize = require('finalhandler');
var livereload = require('livereload');
var port = process.env.PORT || 8080;
var dir = function (subpath) {
  return require('path').join(__dirname, subpath);
};

var app = serve(dir('../dist'));

http.createServer(
  function (req, res, done) {
    var done = finalize(req, res);
    if (!/\.(js|html|css|woff|eot|svg|ttf)/.test(req.url)) {
      req.url = '/index.html';
    }
    app(req, res, done);
  }).listen(port);

var server = livereload.createServer();
server.watch(dir('../dist'));
