"use strict";

const electron = require('electron');
const path = require('path');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

// append command-line options
app.commandLine.appendSwitch('disable-http-cache');

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  let mainWindow = new BrowserWindow({
    width   : 1200, 
    height  : 750,
    show    : true,
    center  : true,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'menu.js'),
    }
  });
  mainWindow.loadURL('http://demo.getweflex.com/calendar');
  app.mainWindow = mainWindow;
});
