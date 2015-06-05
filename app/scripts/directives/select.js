'use strict';

angular.module('wechatApp')
.directive('wfSelect', ['wfAPI', function(wfAPI) {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    template: function(elem, attrs) {
      var model = attrs.model,
          type = attrs.type,
          defaultOptions = 'item.en for item in collection track by item.id',
          options;

      if (type === 'venue') {
        defaultOptions = 'item.name.en for item in collection track by item.id';
      }

      options = attrs.options || defaultOptions;

      return '<select ng-model="'+model+'" ng-options="'+options+'"></select>';
    },
    link: function(scope, elem, attrs) {
      var type = attrs.type,
          collection,
          promise;

      switch (type) {
        case 'category':
          promise = wfAPI.commonAPI.getCategories();
          break;
        case 'level':
          promise = wfAPI.commonAPI.getLevels();
          break;
        case 'venue':
          promise = wfAPI.venueAPI.getVenues();
          break;
        case 'price':
          promise = wfAPI.commonAPI.getPrices();
          break;
        default:
          console.error('Directive wfSelect error: Cannot find type of' + type);
          return;
      };

      promise.success(function(result) {
        scope.collection = result;
        angular.forEach(scope.collection, function(item) {
          item.id = item.id.toString();
        });
      });

    }
  }
}])