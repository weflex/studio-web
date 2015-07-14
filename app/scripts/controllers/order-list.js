(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('OrderListCtrl', ['$scope', 'Orders', 'Users', function($scope, Orders, Users){
    $scope.reverse = true;
    $scope.predicate = '_raw.time_end';

    $scope.order = order;

    activate();

    //////////////////////

    function activate() {
      Orders.query({access_token: Users.accessToken()}).$promise.then(function(response) {
        $scope.orders = response;
        angular.forEach($scope.orders, function(order) {
          if (order._raw && order._raw.time_end) {
            var orderTime = order._raw.time_end;
            order._raw.time_end = orderTime.slice(0, 4) + '-' + orderTime.slice(4, 6) + '-' + orderTime.slice(6, 8) + ' ' + orderTime.slice(8, 10) + ':' + orderTime.slice(10, 12);
          }
        })
      });
    }

    function order(key) {
      $scope.reverse = (key === $scope.predicate ? !$scope.reverse : false);
      $scope.predicate = key;
    }
  }]);
})();