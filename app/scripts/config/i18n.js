'use strict';

angular.module('weflexAdmin')
.config(['$translateProvider', function($translateProvider) {
  $translateProvider
    .preferredLanguage('zh')
    .translations('en', {
      'PROCEED_TO_PAYMENT': 'Proceed to Payment',
      'SHARE': 'Share',
      'SHARE_INSTRUCTION': 'Press the button on the top right corner to share with your friends',
      'ORDER_NOW': 'Order Now',
      'YOU_HAVE_BOUGHT_THIS_CLASS': 'You have already purchased this class',
      'ITEM': 'Class',
      'ADDRESS': 'Location',
      'TIME': 'Time/Date',
      'PRICE': 'Price',
      'STUDIO': 'Studio',
      'PHONE_NUMBER': 'Mobile Number',
      'PAYMENT_ATTENTION': 'Our customer support specialist will reach you by this mobile number',
      'REFUND_POLICY': 'Cancellations must be made at least 3 hours before class time, in order to receive full refund. No cancellations are allowed within 3 hours.',
      'WECHAT_VERSION_IS_TOO_LOW_TO_SUPPORT_PAYMENT_API': 'Please update your Wechat app',
      'CLASS_PASSCODE': 'Passcode',
      'SHOW_PASSCODE_TO_STUDIO_TO_ACCESS': 'Please show the password to the studio\'s front desk',
      'CANCEL_ORDER': 'Cancel Booking',
      'NO_SPOTS': 'Class Full',
      'CONFIRM_CANCEL_ORDER': 'Comfirm cancelation',
      'CONTACT_CUSTOMER_SUPPORT_TO_CANCEL_CLASS': 'Please contact customer service for class cancellation: 13661873664',
      'SUCCESSFULLY_CANCEL_ORDER': '订单成功取消'
    })
    .translations('zh', {
      'PROCEED_TO_PAYMENT': '确认支付',
      'SHARE': '分享',
      'SHARE_INSTRUCTION': '点击右上角的菜单分享给朋友',
      'ORDER_NOW': '现在预订',
      'YOU_HAVE_BOUGHT_THIS_CLASS': '你已经购买过该课程',
      'ITEM': '项目',
      'ADDRESS': '地址',
      'TIME': '时间',
      'PRICE': '价格',
      'STUDIO': '工作室',
      'PHONE_NUMBER': '手机号码',
      'PAYMENT_ATTENTION': '您留下的手机号码是课程发生变动时我们客服人员联系您的重要方式，请填写您最常使用的手机号码。',
      'REFUND_POLICY': '温馨提示：取消预约需至少提前3小时并申请退款，否则无法取消。',
      'WECHAT_VERSION_IS_TOO_LOW_TO_SUPPORT_PAYMENT_API': '微信版本过低，无法支付。',
      'CLASS_PASSCODE': '课程密码',
      'SHOW_PASSCODE_TO_STUDIO_TO_ACCESS': '请向工作人员出示该密码后入场',
      'CANCEL_ORDER': '取消预订',
      'NO_SPOTS': '课位已满',
      'CONFIRM_CANCEL_ORDER': '确定取消订单？',
      'CONTACT_CUSTOMER_SUPPORT_TO_CANCEL_CLASS': '请联系客服人员取消订单: 13661873664',
      'SUCCESSFULLY_CANCEL_ORDER': '订单成功取消'
    })
    .useCookieStorage()
    .useSanitizeValueStrategy('escaped');
}]);