(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('EditDaypassCtrl', EditDaypassCtrl);

  EditDaypassCtrl.$inject = ['adminRouteHelper', '$scope', '$routeParams', 'Daypasses', 'Orders', 'Users'];

  function EditDaypassCtrl(adminRouteHelper, $scope, $routeParams, Daypasses, Orders, Users) {
    var daypassId = $routeParams.daypassId;
    $scope.prodType = 'daypass';

    Daypasses.get({daypassId: daypassId}).$promise.then(function(response) {
      $scope.class = response;
    });

    Orders.query({'filter[where][prodId]': daypassId, access_token: Users.accessToken()}).$promise.then(function(response) {
      $scope.orders = response;
    });

    $scope.onSubmit = function() {
      if($scope.classForm.$valid) {
        $scope.submitDisabled = true;
        Daypasses.update({daypassId: $scope.class.id}, $scope.class).$promise.then(function() {
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
