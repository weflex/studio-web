'use strict';

angular.module('wechatApp')
  .constant('wfConfig', {
    debug: {
      on: true,
      quiet: false
    },
    BASE_URL: {
      API: 'http://api.theweflex.com:8000',
      APP: 'http://daixi.theweflex.com',
      PAYMENT: 'http://daixi.theweflex.com/pay_test/test',
      MEDIA: 'http://api.theweflex.com:5000'
    }
  })
  .constant('wfAPIConfig', {
    BASE_URL: {
      API: 'http://api.theweflex.com:8000'
    }
  })
  .constant('wechatConfig', {
    APP_ID: 'wx1ba55acac2fd5884'
  });
