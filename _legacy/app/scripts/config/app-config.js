'use strict';

angular.module('weflexAdmin')
  .constant('wfConfig', {
    debug: {
      on: true,
      quiet: true
    },
    BASE_URL: {
      API: weflex.env.API_URL
    }
  });
