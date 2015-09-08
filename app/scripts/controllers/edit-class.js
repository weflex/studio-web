(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('EditClassCtrl', EditClassCtrl);

  EditClassCtrl.$inject = ['adminRouteHelper', '$scope', '$routeParams', 'Classes', 'Orders', 'Users'];

  function EditClassCtrl(adminRouteHelper, $scope, $routeParams, Classes, Orders, Users) {
    var classId = $routeParams.classId;
    $scope.prodType = 'class';

    Classes.get({classId: classId}).$promise.then(function(response) {
      $scope.class = response;
    });

    Orders.query({'filter[where][prodId]': classId, access_token: Users.accessToken()}).$promise.then(function(response) {
      $scope.orders = response;
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
