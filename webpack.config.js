const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
const { join } = require('path');
const environments = require('./config/environments.js');
const environment = environments[process.env.env];

function dir (subpath) {
  return join(__dirname, subpath);
}

module.exports = {
  entry: {
    'app': dir('src/index.jsx'),
    //'login/index': dir('src/containers/Login/index.js'),
    //'signup/index': dir('src/containers/Signup/index.jsx'),
  },
  output: {
    path: dir('dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js', '*']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: '/node_modules/',
        use: ExtractTextPlugin.extract({
            fallback: [{
              loader: 'style-loader',
            }],
            use: [{
              loader: 'css-loader',
            }],
        }),
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loaders: ['ts-loader']
      },
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /server/],
        loaders: ['babel-loader']
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
  devServer: {
    open: true,
    inline: true,
    publicPath: '/',
    contentBase: './dist',
    host: '0.0.0.0',
    port: 9002,
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/login\/?(\?status.*)?$/,
          to: '/login/index.html'
        },
        {
          from: /^\/signup\/?$/,
          to: '/signup/index.html'
        }
      ],
      index: '/index.html'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './assets/index.html',
      filename: 'index.html',
      inject: false,
      chunks: ['app'],
      mixpanelToken: environment.mixpanelToken,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': `"${environment.NODE_ENV || 'dev'}"`,
        'GIAN_GATEWAY': `"${environment.GIAN_GATEWAY || 'staging'}"`,
      }
    }),
    new ExtractTextPlugin({
      filename: 'app.css',
      fallback: 'style-loader'
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /^\.\/(zh|en)$/)
  ]
};
