var serve = require('serve-static');
var http = require('http');
var finalize = require('finalhandler');
var livereload = require('livereload');
var port = 8080;

var app = serve('dist');

http.createServer(
  function (req, res, done) {
    var done = finalize(req, res);
    if (!/\.(js|html|css|woff|eot|svg|ttf)/.test(req.url)) {
      req.url = '/index.html';
    }
    app(req, res, done);
  }).listen(port);

var server = livereload.createServer();
server.watch('dist');
