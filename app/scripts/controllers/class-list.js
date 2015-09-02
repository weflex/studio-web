(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('ClassListCtrl', ['$scope', 'Classes', function($scope, Classes){
    $scope.productType = 'class';

    Classes.query().$promise.then(function(classes) {
      $scope.classes = classes;
    });
  }]);
})();
