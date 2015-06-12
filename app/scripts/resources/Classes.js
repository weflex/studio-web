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
        },
        'get': {
          method: 'GET',
          transformResponse: _transformResponse
        }
      };

      return $resource(baseUrl + '/classes/:classId', paramDefaults, actions);

      ////////////////////

      function _transformResponse(data) {
        var aClass = JSON.parse(data);
        _parseDate(aClass);

        return aClass;
      }

      function _parseDate(aClass) {
        if(aClass.from) {
          aClass.from = new Date(aClass.from);
        }
        if(aClass.to) {
          aClass.to = new Date(aClass.to);
        }
      }
    }]);
})();