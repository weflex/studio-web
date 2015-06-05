'use strict';

angular.module('wechatApp')
.factory('wechatUtil', ['md5', function(md5) {
  return {

    sign: function (obj) {

      var key = 'S6YFpcOYBJt9ErExUs9R8kDohkJSTyWH';

      var tmpArray = [];

      for (var k in obj) {
        if (obj.hasOwnProperty(k) && obj[k] && 'sign' !== k) {

          tmpArray.push(k + '=' + obj[k]);

        }
      }

      var str = tmpArray.sort().join('&') + '&key=' + key;

      return md5.createHash(str).toUpperCase();

    },

    random: {

      alphanumeric: function (nchars) {

        var buffer = '';
        var collection = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var c = 0; c < nchars; c++) {

          buffer += collection.charAt(Math.floor(Math.random() * collection.length));

        }

        return buffer;
      }
    }
  }
}]);
