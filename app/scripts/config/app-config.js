'use strict';

angular.module('wechatApp')
  .constant('wfConfig', {
    debug: {
      on: true,
      quiet: true
    },
    BASE_URL: {
      API: 'http://api.theweflex.com',
      PORTAL: 'http://api.theweflex.com',
      APP: 'http://app.theweflex.com'
    }
  })
  .constant('wechatConfig', {
    APP_ID: 'wx1ba55acac2fd5884',
    BASE_URL: {
      API: 'http://api.theweflex.com'
    }
  });
