const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { join } = require('path');
const environments = require('./config/environments.js');
const environment = environments[process.env.env];

function dir (subpath) {
  return join(__dirname, subpath);
}

module.exports = {
  entry: {
    'app': dir('app/index.jsx'),
    'login/index': dir('app/login/index.jsx'),
    'signup/index': dir('app/signup/index.jsx'),
  },
  output: {
    path: dir('dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js', '']
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        exclude: [/node_modules/],
        loader: 'json-loader'
      },
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'ts-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /server/,/dist/],
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-1'],
          plugins: [['import', { style: 'css', libraryName: 'antd' }]],
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
  devServer: {
    open: true,
    inline: true,
    publicPath: '/',
    contentBase: 'assets',
    host: '0.0.0.0',
    port: 8021,
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
        'GIAN_GATEWAY': `"${environment.GIAN_GATEWAY || 'dev'}"`,
      }
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh/),
  ]
};
