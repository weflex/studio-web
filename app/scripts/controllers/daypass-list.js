(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('DaypassListCtrl', ['$scope', 'Daypasses', function($scope, Daypasses){
    $scope.productType = 'daypass';

    Daypasses.query().$promise.then(function(daypasses) {
      $scope.classes = daypasses;
    });
  }]);
})();
