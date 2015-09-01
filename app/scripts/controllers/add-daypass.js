(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('AddDaypassCtrl', ['$scope', 'adminRouteHelper', 'Daypasses', function($scope, adminRouteHelper, Daypasses){
    $scope.productType = 'daypass';

    $scope.class = {
      isTemplate: true
    };

    $scope.onSubmit = function() {
      if ($scope.classForm.$valid) {
        $scope.submitDisabled = true;
        Daypasses.save($scope.class).$promise.then(function() {
          alert('Successfully add daypass.');
          adminRouteHelper.back();
        });
      }
    };

    $scope.onCancel = function() {
      adminRouteHelper.back();
    };
  }]);

})();
