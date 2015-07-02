(function() {
'use strict';

angular.module('weflexAdmin')
  .factory('Users', ['$resource', 'wfConfig', '$rootScope', function($resource, wfConfig, $rootScope){
    var baseUrl = wfConfig.BASE_URL.API;

    var paramDefaults = {
      userId: '@userId'
    };

    var loginResource= $resource(baseUrl + '/api/users/login', {}, {
      'login': {
        method: 'POST',
        transformResponse: _saveAccessToken
      }
    });

    var resource = $resource(baseUrl + '/api/users/:userId');
    resource.login = loginResource.login.bind(loginResource);

    resource.accessToken = function(accessToken) {
      if (accessToken) {
        $rootScope.accessToken = accessToken;
      } else {
        return $rootScope.accessToken;
      }

    }
    return resource;

    /////////////////////

    function _saveAccessToken(data) {
      var response = JSON.parse(data);
      $rootScope.accessToken = response.id;
      return response;
    }
  }]);
})();