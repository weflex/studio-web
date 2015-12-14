(function() {
'use strict';

angular.module('weflexAdmin')
  .factory('Daypasses', ['$resource', 'wfConfig', function($resource, wfConfig){
    var baseUrl = wfConfig.BASE_URL.API + '/api';

    var actions = {
      'update': {
        method: 'PUT'
      }
    };

    return $resource(baseUrl + '/daypasses/:daypassId', {}, actions);
  }]);
})();
