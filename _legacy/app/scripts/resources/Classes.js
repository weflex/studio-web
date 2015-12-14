(function() {
  'use strict';

  angular.module('weflexAdmin')
    .factory('Classes', ['$resource', 'wfConfig', 'Users', function($resource, wfConfig, Users){
      var baseUrl = wfConfig.BASE_URL.API + '/api';
      var paramDefaults = {
        'classId': '@classId'
      };
      var actions = {
        'query': {
          method: 'GET',
          isArray: true,
          transformResponse: _transformArrayResponse
        },
        'update': {
          method: 'PUT'
        },
        'get': {
          method: 'GET',
          transformResponse: _transformResponse
        },
        'templates': {
          method: 'GET',
          isArray: true,
          params: {
            'filter[where][isTemplate]': true
          },
          transformResponse: _transformArrayResponse
        },
        'createTemplate': {
          method: 'POST'
        }
      };

      return $resource(baseUrl + '/classes/:classId', paramDefaults, actions);

      ////////////////////

      function _transformResponse(data) {
        var aClass = JSON.parse(data);
        _parseDate(aClass);

        return aClass;
      }

      function _transformArrayResponse(data) {
        var classes = JSON.parse(data);
        angular.forEach(classes, function(clazz) {
          _parseDate(clazz);
        });
        return classes;
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