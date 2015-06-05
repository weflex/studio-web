'use strict';

angular.module('wechatApp')
.filter('wfi18n', ['$translate', function($translate) {
  return function(obj) {
    if(!obj || !obj.i18n) {
      return obj;
    }
    return obj[$translate.use()];
  }
}]);