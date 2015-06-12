'use strict';

angular.module('weflexAdmin')
.controller('AddClassCtrl', ['$scope', 'adminRouteHelper', 'Classes', function($scope, adminRouteHelper, Classes) {

  $scope.class = {};

  $scope.onSubmit = function() {
    if ($scope.classForm.$valid) {
      $scope.submitDisabled = true;
      Classes.save($scope.class).$promise.then(function() {
        alert('Successfully add class.');
        adminRouteHelper.toHome();
      });
    }
  }
  $scope.onCancel = function() {
    adminRouteHelper.toHome();
  };
}]);