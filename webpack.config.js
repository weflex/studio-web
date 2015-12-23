'use strict';

var webpack = require('webpack');
function dir (subpath) {
  return require('path').join(__dirname, subpath);
}

module.exports = {
  entry: dir('app/index.jsx'),
  output: {
    path: dir('dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.jsx', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        exclude: [/node_modules/, /server/],
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-0', 'stage-1', 'stage-2', 'stage-3']
        }
      }, 
      {
        test: /\.js$/,
        exclude: [/node_modules/, /server/],
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0', 'stage-1', 'stage-2', 'stage-3']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
};
