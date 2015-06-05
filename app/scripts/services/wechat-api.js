'use strict';

angular.module('wechatApp')
.factory('wechatAPI', ['$window', '$translate', 'wechatConfig', 'wfDebug', 'wfUrlUtil', '$http', function($window, $translate, wechatConfig, wfDebug, wfUrlUtil, $http) {
  var APP_ID = wechatConfig.APP_ID,
      BASE_URL = wechatConfig.BASE_URL;

  function isPaymentAPISupported() {

      var pattern = /MicroMessenger\/([\d]+).?/ig,
          result = pattern.exec($window.navigator.userAgent);

      return result && parseInt(result[1], 10) >= 5;

  }


  return {

    sign: function(params) {
      wfDebug.log('Get sign: ' + BASE_URL.API);
      return $http.post(BASE_URL.API + '/common/sign', params)
                  .success(function() {
                    wfDebug.log('successfully get sign');
                  });
    },


    oAuthUrl: function(redirectUri, type) {
      return wfUrlUtil.concatUrl('https://open.weixin.qq.com/connect/oauth2/authorize', {
        'appid': APP_ID,
        'redirect_uri': redirectUri,
        'response_type': 'code',
        'scope': 'snsapi_' + (type ||'base')
      }, 'wechat_redirect');
    },


    oAuth: function(redirectUrl, type) {
      wfDebug.log(redirectUrl);
      location.replace(this.oAuthUrl(redirectUrl, type));
    },


    hideOptionMenu: function() {
      if (window.WeixinJSBridge) {
        WeixinJSBridge.call('hideOptionMenu');
      }
    },


    pay: function(order, callback) {
      //TODO: Test
      if (!isPaymentAPISupported()) {
        $translate('WECHAT_VERSION_IS_TOO_LOW_TO_SUPPORT_PAYMENT_API').then(function(translation) {
          alert(translation);
        });
        return;
      }
      var nonceStr = Math.random().toString(36).substr(2, 15),
          timestamp = parseInt(new Date().getTime() / 1000, 10) + '',
          params = {
            'appId' : APP_ID,
            'timeStamp': timestamp,
            'nonceStr' : nonceStr,
            'package' : 'prepay_id=' + order.prepayId,
            'signType' : 'MD5'
          };

      this.sign(params).success(function(sign) {
        params.paySign = sign;
        if(typeof WeixinJSBridge == "undefined"){
          wfDebug.log('WeixinJSBridge is undefined');
           if( document.addEventListener ){
               document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
           } else if (document.attachEvent){
               document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
               document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
           }
        } else {
          wfDebug.log('WeixinJSBridge is defined');
          onBridgeReady();
        }
      });

      function onBridgeReady(){
        wfDebug.log('params: ' + JSON.stringify(params));
        WeixinJSBridge.invoke(
          'getBrandWCPayRequest', params,
          function(res){
            if(res.err_msg == "get_brand_wcpay_request:ok" ) {
              if (callback && typeof callback === 'function') {
                callback.call();
              }
            } else {
              wfDebug.error(res.err_msg);
            }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
          }
        );
      }
    }

  }
}])
