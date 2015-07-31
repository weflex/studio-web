(function() {
  'use strict';

  angular.module('weflexAdmin')
    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push(['$q', '$rootScope', function($q, $rootScope) {
        return {
          'responseError': function(rejection) {
            if (rejection.data.error.status === 401 && rejection.data.error.message !== 'login failed') {
              var deferred = $q.defer();
              var req = {
                config: rejection.config,
                deferred: deferred
              };
              $rootScope.requestsUnAuthorized.push(req);
              $rootScope.$broadcast('event:loginRequired');
              return deferred.promise;
            }
            return $q.reject(rejection);
          }
        }
      }]);
    }]);
})();
