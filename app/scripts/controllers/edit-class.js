(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('EditClassCtrl', EditClassCtrl);

  EditClassCtrl.$inject = ['adminRouteHelper', '$scope', '$routeParams', 'Classes', 'Orders', 'Users', 'Venues'];

  function EditClassCtrl(adminRouteHelper, $scope, $routeParams, Classes, Orders, Users, Venues) {
    var classId = $routeParams.classId;

    Classes.get({classId: classId}).$promise.then(function(response) {
      $scope.class = response;
    });

    Orders.query({'filter[where][classId]': classId, access_token: Users.accessToken()}).$promise.then(function(response) {
      $scope.orders = response;
    });

    Venues.query().$promise.then(function(res) {
      $scope.venues = res;
    });

    $scope.onSubmit = function() {
      if($scope.classForm.$valid) {
        $scope.submitDisabled = true;
        Classes.update({classId: $scope.class.id}, $scope.class).$promise.then(function() {
          alert('Edit class success');
          adminRouteHelper.back();
        });
      }
    };

    $scope.onCancel = function() {
      adminRouteHelper.back();
    };
  }
})();