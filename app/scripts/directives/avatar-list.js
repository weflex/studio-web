(function() {
  'use strict';

  angular
    .module('wechatApp')
    .directive('wfAvatarList', wfAvatarList);

  function wfAvatarList() {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        list: '='
      },
      link: link,
      template: '<div class="avatar-list" ng-show="list.length > 0">'+
                  '<ul ng-style="width">'+
                    '<li ng-repeat="item in list" class="avatar">'+
                      '<img ng-src="{{item.headimgurl}}" />'+
                    '</li>'+
                  '</ul>'+
                '</div>'
    };

    return directive;

    function link(scope, elem, attrs) {
      var margin = 12,
          border = 1,
          imageWidth = 50;

      var done = scope.$watch('list', function(newValue, oldValue) {
        if (newValue && newValue.length > 0) {
          scope.width = {
            width: (imageWidth * newValue.length + margin * newValue.length) + 'px'
          };
          done();
        }
      });
    }
  }
})();