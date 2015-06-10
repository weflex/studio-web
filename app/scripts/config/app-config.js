'use strict';

angular.module('weflexAdmin')
  .constant('wfConfig', {
    debug: {
      on: true,
      quiet: true
    },
    BASE_URL: {
      API: 'https://weflex-api-dev.herokuapp.com',
      PORTAL: 'http://api.theweflex.com',
      APP: 'http://app.theweflex.com'
    }
  });
