(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('VoucherCtrl', ['$scope', '$route', 'Coins', function ($scope, $route, Coins) {

    function getBatchId (c) {
      return [c.owner, c.campaign, c.value].join('_');
    }

    function newBatch (c) {
      return {
        batchId:   getBatchId(c),
        number:    1,
        available: c.userId ? 0 : 1,
        value:     c.value,
        owner:     c.owner,
        campaign:  c.campaign,
        members:   [c]
      };
    }

    Coins.query().$promise.then(function(coins) {
      $scope.batches = coins.reduce(function (batches, coin, index) {

        if (1 === index) {
          var first = batches;
          batches = [newBatch(first)];
        }

        var batchId = getBatchId(coin);
        var sameBatch = batches.filter(function (b) {
          return b.batchId === batchId;
        })[0];

        if (sameBatch) {
          sameBatch.members.push(coin);
          sameBatch.number++;
          if (!coin.userId) {
            sameBatch.available++;
          }
        } else {
          batches.push(newBatch(coin));
        }

        return batches;
      });

      $scope.download = function (obj) {
        return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
      };

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
    });
  }]);
})();
