'use strict';

angular.module('wechatApp')
.factory('wfArrayUtil', function() {
  return {
    groupBy: function(array, comparator) {
      var _result = [];

      if (!array) {
        return;
      }

      if (!comparator) {
        comparator = function(a, b) {
          return a === b;
        }
      }

      function inGroup(group, item) {
        return comparator(group[0], item);
      }

      angular.forEach(array, function(item) {
        var i;

        for (i = 0; i < _result.length; i++) {
          if (inGroup(_result[i], item)) {
            _result[i].push(item);
            break;
          }
        }

        if (i >= _result.length) {
          _result.push([item]);
        }
      });

      return _result;
    }
  }
});
