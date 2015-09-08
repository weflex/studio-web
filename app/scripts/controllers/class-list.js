(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('ClassListCtrl', ['$scope', 'Classes', function($scope, Classes){
    $scope.prodType = 'class';

    Classes.query().$promise.then(function(classes) {
      $scope.classes = classes;
    });
  }]);
})();
