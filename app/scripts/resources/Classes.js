(function() {
  'use strict';

  angular.module('weflexAdmin')
    .factory('Classes', ['$resource', 'wfConfig', function($resource, wfConfig){
      var baseUrl = wfConfig.BASE_URL.API + '/api';
      var paramDefaults = {
        'classId': '@classId'
      };
      var actions = {
        'update': {
          method: 'PUT'
        }
      };

      return $resource(baseUrl + '/classes/:classId', paramDefaults, actions);
    }]);
})();