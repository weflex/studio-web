"use strict";

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  const serve = require('serve-static');
  const http = require('http');
  const finalize = require('finalhandler');
  const livereload = require('livereload');
  const port = process.env.PORT || 8080;
  const app = serve(__dirname);

  function handler(req, res, next) {
    var done = finalize(req, res);
    if (!/\.\w+(\?.*)?$/.test(req.url)) { // if url is not a file path
      if (/^\/login(\/.*)?/.test(req.url)) { // redirect to /login/index.html
        req.url = '/login.html';
      } else {
        req.url = '/index.html';
      }
    }
    app(req, res, done);
  }

  function openWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1000, height: 750});
    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:' + port);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
  }

  http.createServer(handler)
  .listen(port, function() {
    openWindow();
  });
});
