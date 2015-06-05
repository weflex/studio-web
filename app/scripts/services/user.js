(function() {
  'use strict';

  angular
    .module('wechatApp')
    .factory('wfUser', wfUser);

  wfUser.$inject = ['wfDebug', '$cookies', '$location', 'wechatAPI', 'wfUrlUtil', 'wfConfig'];

  function wfUser(wfDebug, $cookies, $location, wechatAPI, wfUrlUtil, wfConfig) {
    var BASE_URL = wfConfig.BASE_URL;

    var factory = {
      set: set,
      get: get,
      login: login,
      hasLoggedIn: hasLoggedIn
    };

    return factory;

    //////////////////////

    function set() {
      if (arguments.length === 2) {
        $cookies[arguments[0]] = arguments[1];
      }
      if (arguments.length === 1) {
        angular.forEach(arguments[0], function(value, key) {
          $cookies[key] = value;
        });
      }
    }

    function get(key) {
      if (!key) {
        return;
      }
      return $cookies[key];
    }

    function login() {

      var originalUrl = $location.absUrl();
      var redirectUrl = wfUrlUtil.concatUrl(BASE_URL.PORTAL + '/oauth', {original_url: originalUrl});

      wfDebug.log('ready to login... redirect url is: ' + redirectUrl);
      wechatAPI.oAuth(redirectUrl, 'userinfo');
    }

    function hasLoggedIn() {
      var search = $location.search();
      if (search.openid) {
        this.set('openid', search.openid);
        this.set('phone', search.phone);
        return search.openid;
      }

      wfDebug.log('Checking if user has logged in...' + this.get('openid'));
      return this.get('openid');
    }
  }
})();
