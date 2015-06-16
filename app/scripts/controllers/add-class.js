'use strict';

angular.module('weflexAdmin')
.controller('AddClassCtrl', ['$scope', 'wfAPI', 'adminRouteHelper', function($scope, wfAPI, adminRouteHelper) {
  $scope.submitDisabled = false;
  $scope.class = {};

  $scope.onSubmit = function() {
    if ($scope.classForm.$valid) {
      $scope.submitDisabled = true;
      wfAPI.classAPI.addClass($scope.class).success(function() {
        alert('Successfully add class.');
        adminRouteHelper.toHome();
      })
      .error(function() {
        alert('Add class failed.');
        console.error('AddClassCtrl Error: Add class failed.');
      });
    }
  }
  $scope.onCancel = function() {
    adminRouteHelper.toHome();
  };
}]);