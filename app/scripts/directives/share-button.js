(function() {
  'use strict';

  angular
    .module('wechatApp')
    .directive('wfShareButton', wfShareButton);

  function wfShareButton() {
    var directive = {
      restrict: 'E',
      replace: true,
      template: template,
      link: link
    };

    return directive;

    ///////////////////

    function template(elem, attrs) {
      return '<div class="share-button">'+
              '<div ng-show="showMask" ng-click="showMask=false" class="overlay">'+
                '<div class="share-mask"></div>'+
                '<img ng-src="images/arrow.png" />'+
                '<div class="text-wrapper"><div class="text" translate="SHARE_INSTRUCTION"></div></div>'+
              '</div>'+
              '<button class="button red" ng-click="showMask=true"><span translate="SHARE"></span></button>'+
             '</div>';
    }

    function link(scope, elem, attrs) {
      scope.showMask = false;
    }
  }
})();