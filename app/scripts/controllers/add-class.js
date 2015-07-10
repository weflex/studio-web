'use strict';

angular.module('weflexAdmin')
.controller('AddClassCtrl', ['$scope', '$routeParams', 'adminRouteHelper', 'Classes', 'Users', function($scope, $routeParams, adminRouteHelper, Classes, Users) {
  var copiedFrom = $routeParams.copied_from;

  if (!copiedFrom) {
    $scope.class = {
      isTemplate: true
    }
  } else {
    Classes.get({classId: copiedFrom}).$promise.then(function(template) {
      $scope.class = angular.copy(template);
      $scope.class.id = null;
      $scope.class.attendees = [];
      $scope.class.copiedFrom = template.id;
      $scope.class.isTemplate = false;
    });
  }

  $scope.onSubmit = function() {
    if ($scope.classForm.$valid) {
      $scope.submitDisabled = true;
      Classes.save($scope.class).$promise.then(function() {
        alert('Successfully add class.');
        adminRouteHelper.back();
      });
    }
  }
  $scope.onCancel = function() {
    adminRouteHelper.back();
  };
}]);