'use strict';

angular.module('weflexAdmin')
.controller('EditClassCtrl', ['$scope', '$routeParams', 'adminRouteHelper', 'Classes', function($scope, $routeParams, adminRouteHelper, Classes) {

  var classId = $routeParams.classId;

  Classes.get({classId: classId}).$promise.then(function(response) {
    $scope.class = response;
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
}]);