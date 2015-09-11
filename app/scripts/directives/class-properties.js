(function() {
'use strict';

angular.module('weflexAdmin')
  .directive('wfClassProperties', function() {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        list: '='
      },
      template: '<ul class="class-properties">'+
                  '<li ng-repeat="(property, checked) in list">'+
                    '<label class="label">'+
                      '<input type="checkbox" ng-model="list[property]" />'+
                      '{{property}}'+
                    '</label>'+
                  '</li>'+
                '</ul>',
      link: link
    };

    return directive;

    function link(scope, elem, attrs) {
      scope.allProperties = {
        isPTrainer: false,
        isForLadies: false
      };

      scope.list = angular.copy(scope.allProperties);

      scope.$watch('list', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          angular.forEach(scope.allProperties, function(value, prop) {
            newValue[prop] = newValue[prop] || scope.allProperties;
          });
        }
      });
    }
  });
})();
