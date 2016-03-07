#!/usr/bin/env node

const path = require('path');
const packager = require('electron-packager');
const appdmg = require('appdmg');

const config = require('./package.json').build;
const installer = require('./package.json').installers['osx'];

packager(config, function(err, appPath) {
  if (err) throw err;
  console.log('Built WeFlex Studio Desktop at:', appPath);
  appdmg({
    target: 'osx-installer',
    basepath: __dirname,
    specification: installer
  });
});
