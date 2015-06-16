'use strict';

angular.module('weflexAdmin')
.controller('EditClassCtrl', ['$scope', '$routeParams', 'adminRouteHelper', 'wfAPI', function($scope, $routeParams, adminRouteHelper, wfAPI) {
  $scope.submitDisabled = false;
  var classId = $routeParams.classId;

  wfAPI.classAPI.getClassById(classId).success(function(result) {
    $scope.class = result;
  });


  $scope.onSubmit = function() {
    if($scope.classForm.$valid) {
      $scope.submitDisabled = true;
      wfAPI.classAPI.updateClass(classId, $scope.class).success(function() {
        alert('Edit class success');
        adminRouteHelper.toHome();
      })
      .error(function() {
        console.error('EditClassCtrl: Edit class failed.');
      });
    }
  };

  $scope.onCancel = function() {
    adminRouteHelper.toHome();
  };
}]);