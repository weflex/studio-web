'use strict';

angular
  .module('weflexAdmin')
  .controller('LoginCtrl', ['$scope', 'Users', '$rootScope', '$location', function($scope, Users, $rootScope, $location) {

    $scope.onLogin = function () {

      var username = $scope.username
        , password = $scope.password;

      if (username && password) {
        Users.login(
          {
            username: username,
            password: password
          }
        )
        .$promise.then(
          function () {
            $rootScope.$broadcast('event:loginConfirmed');
            $location.url('/admin');
          },
          loginFailed
        );
      }
      else {
        loginFailed();
      }

      function loginFailed () {
        alert('Login failed. Check your credentials.');
      }
    };
  }]);
