(function() {
  'use strict';

  angular
    .module('wechatApp')
    .controller('OrderCtrl', OrderCtrl);

  OrderCtrl.$inject = ['$location', '$translate', 'wfDebug', 'wfUser', 'wechatAPI', '$routeParams', 'wfAPI'];

  function OrderCtrl($location, $translate, wfDebug, wfUser, wechatAPI, $routeParams, wfAPI) {
    /* jshint validthis: true*/
    var vm = this;

    var openid,
        search = $location.search(),
        orderId = $routeParams.orderId,
        code = search.code;

    vm.onCancelOrder = onCancelOrder;

    activate();

    /////////////////////

    function activate() {
      // wechatAPI.hideOptionMenu();

      if(!wfUser.hasLoggedIn()) {
        wfUser.login();
        return;
      }

      openid = wfUser.get('openid');
      orderId = $routeParams.orderId;

      wfAPI.orderAPI.getOrders({order_id: orderId, openid: openid, status: 'paid'})
        .success(function(orders) {
          if(orders.length && orders.length > 0) {
            vm.order = orders[0];
          }
      });
    }

    function onCancelOrder() {
      //TODO: Replace cancel message to 'contact customer support to refund.'
      $translate(['CONTACT_CUSTOMER_SUPPORT_TO_CANCEL_CLASS']).then(function(result){
        var confirmTitle = result.CONTACT_CUSTOMER_SUPPORT_TO_CANCEL_CLASS;

        alert(confirmTitle);
      });
    }

  }
})();