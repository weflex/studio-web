(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('EditClassCtrl', EditClassCtrl);

  EditClassCtrl.$inject = ['$scope', '$routeParams', 'adminRouteHelper', 'Classes', 'Orders', 'Users'];

  function EditClassCtrl($scope, $routeParams, adminRouteHelper, Classes, Orders, Users) {
    var classId = $routeParams.classId;

    Classes.get({classId: classId}).$promise.then(function(response) {
      $scope.class = response;
    });

    Orders.query({'filter[where][classId]': classId, access_token: Users.accessToken()}).$promise.then(function(response) {
      $scope.orders = response;
    });

    $scope.onSubmit = function() {
      if($scope.classForm.$valid) {
        $scope.submitDisabled = true;
        Classes.update({classId: $scope.class.id}, $scope.class).$promise.then(function() {
          alert('Edit class success');
          adminRouteHelper.toHome();
        });
      }
    };

    $scope.onCancel = function() {
      adminRouteHelper.toHome();
    };
  }
})();