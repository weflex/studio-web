(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('VoucherCtrl', ['$scope', '$route', 'Coins', function ($scope, $route, Coins) {

    Coins.query().$promise.then((coins) => {
      let coinsInBatch = coins.reduce((batches, coin, index) => {
        let batchId = [coin.owner, coin.campaign, coin.value].join('_');
        if (typeof batches[batchId] === 'undefined') {
          batches[batchId] = [];
        }
        batches[batchId].push(coin);
        return batches;
      }, {});

      $scope.batches = Object.keys(coinsInBatch)
        .map((batchId) => coinsInBatch[batchId])
        .map((members) => {
          return {
            members: members,
            number: members.length,
            available: members.filter((c) => !c.userId).length,
            asJSON: 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members))
          };
        });
    });

    $scope.voucher = {};
    $scope.count   = 0;

    $scope.onTickAssignUser = function () {
      if ($scope.assignUser) {
        $scope.voucher.owner = 'WeFlex';
        $scope.voucher.campaign = 'Admin';
        $scope.count = 1;
      }
    };

    $scope.onSubmit = function () {
      if (!$scope.voucherForm.$valid) {
        return false;
      }
      $scope.submitDisabled = true;

      Coins.batch($scope.voucher, $scope.count).$promise
        .then(function (status) {
          var coinId = status.results[0].id;

          if ($scope.assignUser && coinId) {
            return Coins.assign(coinId, $scope.assignUserId).$promise
          }
          return;
        })
        .then(function () {
          $route.reload();
        });
    };
  }]);
})();
