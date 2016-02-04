"use strict";

const webpack = require('webpack');

function dir (subpath) {
  return require('path').join(__dirname, subpath);
}

module.exports = {
  entry: {
    "app.js": dir('app/index.jsx'),
    "login/index.js": dir('app/login/index.jsx')
  },
  output: {
    path: dir('dist'),
    filename: "[name]"
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
          presets: ['react', 'es2015', 'stage-1']
        }
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, /server/],
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-1']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh/),
    new webpack.optimize.DedupePlugin()
  ]
};
