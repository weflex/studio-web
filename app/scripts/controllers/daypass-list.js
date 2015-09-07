(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('DaypassListCtrl', ['$scope', 'Daypasses', function($scope, Daypasses){
    $scope.prodType = 'daypass';

    Daypasses.query().$promise.then(function(daypasses) {
      $scope.classes = daypasses;
    });
  }]);
})();
