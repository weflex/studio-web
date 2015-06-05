(function() {
  'use strict';

  angular
    .module('wechatApp')
    .directive('wfOrderButton', wfOrderButton);

  wfOrderButton.$inject = ['wfDebug', '$translate', 'wfConfig', 'wfUrlUtil', 'wechatAPI'];

  function wfOrderButton(wfDebug, $translate, wfConfig, wfUrlUtil, wechatAPI) {
    var BASE_URL = wfConfig.BASE_URL;

    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        paymentData: '=',
        enableCondition: '='
      },
      template: template,
      compile: compile
    };

    return directive;

    function link(scope, elem, attrs) {
       scope.payUrl = 'javascript:void(0)';

      scope.onOrder = function() {
        wfDebug.log('order-button.js: onOrder triggered, routing to ' + scope.payUrl);
        location.assign(scope.payUrl);
      };

      var done = scope.$watch('paymentData', function(newValue, oldValue) {
        var redirectUrl, search;

        if (newValue && scope.enableCondition) {
          search = newValue;
          search.lang = $translate.use();
          scope.payUrl = wfUrlUtil.concatUrl('/views/payment', search);
          done();
        }
      });
    }

    function template(elem, attrs) {
      if (!attrs.paymentData) {
        console.error('Directive wfPayButton error: attribute paymentData should be provided.');
        return;
      }

      var text = attrs.value || '订购',
          disableText = attrs.disableValue || '售罄';

      return '<button class="order-button button" ng-click="onOrder()" ng-class="{disabled: !enableCondition}">'+
              '<span ng-show="enableCondition" translate="'+text+'"></span>'+
              '<span ng-show="!enableCondition" translate="'+disableText+'"></span>'+
             '</button>';
    }

    function compile(elem, attrs) {
      if (!attrs.paymentData) {
        console.error('Directive wfPayButton error: attribute paymentData should be provided.');
        return;
      }
      return link;
    }
  }
})();