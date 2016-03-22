#!/usr/bin/env node
"use strict";

const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;
const packager = require('electron-packager');
const appdmg = require('appdmg');
const yazl = require('yazl');
const qiniu = require('qiniu');

const config = require('./package.json').build;
const releases = require('./package.json').releases;
const installers = require('./package.json').installers;

function pack() {
  return new Promise(function(resolve, reject) {
    packager(config, function(err, paths) {
      if (err) {
        reject(err);
      } else {
        resolve(paths);
      }
    });
  });
}

function compressOSX(sourcePath) {
  const target = '../dist-electron/WeFlex Studio-OSX-Installer';
  const destPath = target + '.dmg';
  const spec = installers.osx;
  let fileAttached = false;
  spec.contents.forEach(function(content, index) {
    if (content.type === 'file' && !content.path) {
      spec.contents[index].path = sourcePath + '/' + spec.title + '.app';
      fileAttached = true;
    }
  });
  if (!fileAttached) {
    throw new Error('file need to be attached, please add a content with file type');
  } else {
    try {
      fs.unlinkSync(destPath);
    } catch (err) { /* null op */ }
  }
  return new Promise(function(resolve, reject) {
    const ee = appdmg({
      target: target,
      basepath: __dirname,
      specification: spec,
    });
    ee.on('finish', function() {
      console.log('compressed ' + destPath);
      resolve(destPath);
    });
    ee.on('error', reject);
  });
}

// TODO(Yorkie): will use windows installer later
function compressLinuxOrWindows(sourcePath) {
  return new Promise(function(resolve, reject) {
    const target = new yazl.ZipFile();
    const destPath = sourcePath + '.zip';
    const fileStream = fs.createWriteStream(destPath);
    glob(sourcePath + '/**/*.*').forEach(function(pathname) {
      const realPath = path.resolve(__dirname, pathname);
      const metaPath = pathname.replace('../dist-electron/', '');
      target.addFile(realPath, metaPath);
    });
    target.outputStream.pipe(fileStream, {
      end: true
    });
    fileStream.on('finish', function() {
      console.log('compressed ' + destPath);
      resolve(destPath);
    });
    fileStream.on('error', function(err) {
      reject(err);
    });
    target.end();
  });
}

function compress(paths) {
  const compressQueue = paths.map(function(pathname) {
    if (/darwin\-x64$/.test(pathname)) {
      return compressOSX(pathname);
    } else {
      return compressLinuxOrWindows(pathname);
    }
  });
  return Promise.all(compressQueue);
}

function release(paths) {
  const config = releases.qiniu;
  qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = config.SECRET_KEY;
  return Promise.all(
    paths.map(function(filepath) {
      return new Promise(function(resolve, reject) {
        const key = path.basename(filepath);
        const scope = `${config.bucket}:${key}`;
        const policy = new qiniu.rs.PutPolicy(scope);
        const token = policy.token();
        const extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(token, key, filepath, extra, ondone);
        function ondone(err, ret) {
          if (err) {
            reject(err);
          } else {
            console.log('uploaded', scope, ret.hash);
            resolve();
          }
        }
      });
    })
  );
}

function onerror(err) {
  console.error(err && err.stack);
  process.exit(1);
}

pack()
  .then(compress)
  .then(release)
  .catch(onerror);
