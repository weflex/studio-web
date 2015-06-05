(function() {
  'use strict';

  angular
    .module('wechatApp')
    .controller('OAuthRedirectCtrl', OAuthRedirectCtrl);

  OAuthRedirectCtrl.$inject = ['$location', 'wfDebug', 'wfAPI', 'wfUser', 'customerRouteHelper'];

  function OAuthRedirectCtrl($location, wfDebug, wfAPI, wfUser, customerRouteHelper) {

    var search = $location.search(),
        openid = search.openid,
        originalUrl = search['original_url'];

    activate();

    //////////////////////////

    function activate() {

      if (!openid) {
        wfDebug.log('openid missing.');
        customerRouteHelper.toClassList();
        return;
      }

      wfAPI.userAPI.getUserinfo(openid)
               .success(_getUserinfoSuccessHandler)
               .error(_getUserinfoErrorHandler);

    }

    function _getUserinfoSuccessHandler(user) {
      if (user && user.openid){
        wfUser.set('openid', user.openid);

        //TODO: Set real phone number after api implemented.

        wfDebug.log('redirect to original url: ' + originalUrl);
        _redirectTo(originalUrl);
      }
    }

    function _getUserinfoErrorHandler(result) {
      customerRouteHelper.toClassList();
    }

    function _redirectTo(url) {
      location.replace(url);
    }
  }
})();
