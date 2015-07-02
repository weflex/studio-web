(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('OrderListCtrl', ['$scope', 'Orders', 'Users', function($scope, Orders, Users){

    Orders.query({access_token: Users.accessToken()}).$promise.then(function(response) {
      $scope.orders = response;
    });
  }]);
})();