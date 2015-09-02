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
      scope.list = {
        isPTrainer: false,
        isForLadies: false
      };
    }
  });
})();
