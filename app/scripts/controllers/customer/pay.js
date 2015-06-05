(function() {
  'use strict';

  angular
    .module('wechatApp')
    .controller('PayCtrl', PayCtrl);

  PayCtrl.$inject = ['$scope', '$translate', 'wfDebug', '$location', 'wechatAPI', 'wfAPI', 'wfUser', 'customerRouteHelper'];

  function PayCtrl($scope, $translate, wfDebug, $location, wechatAPI, wfAPI, wfUser, customerRouteHelper) {

    var search = $location.search();

    $scope.prepayOrderCreated = false;
    $scope.event = {
      classId: search.class_id,
      classTitle: search.class_title,
      venueName: search.venue,
      venueAddress: search.venue_address,
      price: search.cost,
      timeFrom: new Date(parseInt(search.time_from, 10)),
      timeTo: new Date(parseInt(search.time_to, 10))
    };
    $scope.phonePlaceholder = {
      i18n: true,
      zh: '请输入手机号码',
      en: 'Please enter your mobile number here'
    }

    $scope.onPay = onPay;

    activate();

    /////////////////////

    function activate() {

      wechatAPI.hideOptionMenu();
      if(!wfUser.hasLoggedIn()) {
        wfUser.login();
        return;
      }

      $scope.user = {
        openid: wfUser.get('openid'),
        phone: wfUser.get('phone')
      };

      _checkIfHasBoughtClass({
          openid: $scope.user.openid,
          classId: $scope.event.classId,
          price: $scope.event.price,
          classTitle: $scope.event.classTitle
        },
         _hasBoughtClassHandler,
         _hasNotBoughtClassHandler
      );

      function _checkIfHasBoughtClass(params, hasBoughtHandler, hasNotBoughtHandler) {
        wfDebug.log('pay.js: Check if has bought this class');
        wfAPI.orderAPI.getOrders({openid: params.openid, event_id: params.classId, status: 'paid'})
          .success(function(orders) {
            if (!orders || orders.length === 0) {
              hasNotBoughtHandler(params);
            } else {
              hasBoughtHandler();
            }
          });
      }

      function _hasNotBoughtClassHandler(params) {
        wfDebug.log('pay.js: create order');
        _createOrder(params.classId, params.price, params.classTitle, params.openid);
      }

      function _hasBoughtClassHandler() {
        $translate('YOU_HAVE_BOUGHT_THIS_CLASS').then(function(youHaveBoughtClassMessage) {
          alert(youHaveBoughtClassMessage);
          customerRouteHelper.toClassList();
        });
      }

      function _createOrder(classId, cost, classDesc, openid) {
        wfAPI.orderAPI.createWechatOrder(classId, cost, classDesc, openid).success(function(result) {
          if (result.prepay_id) {
            $scope.prepayId = result.prepay_id;
            $scope.orderId = result.order_id;
            $scope.prepayOrderCreated = true;
          }
        });
      }
    }

    function onPay() {
      if (!$scope.prepayId) {
        wfDebug.log('No prepayId');
        return;
      }

      wfAPI.userAPI.updateUser($scope.user).success(function() {
        wfUser.set('phone', $scope.user.phone);
        wechatAPI.pay({
            prepayId: $scope.prepayId,
            orderId: $scope.orderId
          },
          function() {
            location.replace('/orders/' + $scope.orderId);
          }
        );
      }).error(function(data, status) {
        wfDebug.error(status);
      });
    }
  }
})();