(function() {
'use strict';

angular.module('weflexAdmin')
  .controller('VoucherCtrl', ['$scope', 'Coins', function($scope, Coins){

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
          let first = batches;
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
    });
  }]);
})();
