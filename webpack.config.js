"use strict";

const webpack = require('webpack');

function dir (subpath) {
  return require('path').join(__dirname, subpath);
}

module.exports = {
  entry: {
    'app.js': dir('app/index.jsx'),
    'login/index.js': dir('app/login/index.jsx'),
    'signup/index.js': dir('app/signup/index.jsx'),
  },
  output: {
    path: dir('dist'),
    filename: '[name]'
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
      },
      {
        test: /\.(jpg|png|svg)$/,
        loader: 'file-loader',
        query: {
          name: 'images/[1]',
          regExp: 'app\/(.*)'
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'dev'}"`,
      'process.env.GIAN_GATEWAY': `"${process.env.GIAN_GATEWAY || 'staging'}"`,
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh/),
    new webpack.optimize.DedupePlugin(),
  ]
};
