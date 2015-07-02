'use strict';

/**
 * @ngdoc overview
 * @name weflexAdmin
 * @description
 * # weflexAdmin
 *
 * Main module of the application.
 */
angular
.module('weflexAdmin', [
  'ngCookies',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ngResource',
  'angularMoment',
  'pascalprecht.translate'
])
.run(['$rootScope', 'Users', '$http', function($rootScope, Users, $http) {
  $rootScope.requestsUnAuthorized = [];
  $rootScope.$on('event:loginConfirmed', function() {
    var requests = $rootScope.requestsUnAuthorized;
    for (var i = 0; i < requests.length; i++) {
      _retry(requests[i]);
    }

    function _retry(request) {
      request.config.params = request.config.params || {};
      request.config.params.access_token = Users.accessToken();
      $http(request.config).then(function(response) {
        request.deferred.resolve(response);
      });
    }
  });
  $rootScope.$on('event:loginRequired', function() {
    Users.login({username: 'king', password: 'iamthekingoftheweflex'}).$promise.then(function() {
      $rootScope.$broadcast('event:loginConfirmed');
    })
  });
}])
.run(['$location', 'amMoment', '$translate', function($location, amMoment, $translate) {
  if ($location.search().lang) {
    $translate.use($location.search().lang);
  }

  amMoment.changeLocale($translate.use());
}]);
