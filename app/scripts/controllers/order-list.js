(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('OrderListCtrl', ['$scope', 'Orders', 'Users', function($scope, Orders, Users){
    if (!Users.accessToken()) {
      Users.login({username: 'king', password: 'iamthekingoftheweflex'}).$promise.then(function() {
        getOrders();
      });
    } else {
      getOrders();
    }

    function getOrders() {
      Orders.query({access_token: Users.accessToken()}).$promise.then(function(response) {
        $scope.orders = response;
      });
    }
  }]);
})();