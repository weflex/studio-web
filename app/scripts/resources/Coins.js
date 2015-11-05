(function() {
  'use strict';

  angular.module('weflexAdmin')
    .factory('Coins', ['$resource', '$cookies', 'wfConfig', 'Users', function ($resource, $cookies, wfConfig, Users) {
      var baseUrl = wfConfig.BASE_URL.API + '/api';
      var paramDefaults = {
        'access_token': $cookies.accessToken
      };
      var query = {
        method: 'GET',
        isArray: true
      };

      var batch = {
        method: 'POST'
      };

      var assign = {
        method: 'POST'
      };

      return {
        query: function () {
          return $resource(baseUrl + '/coins/', paramDefaults, {query}).query();
        },
        batch: function (data, count) {
          return $resource(baseUrl + '/coins/batch', paramDefaults, {batch})
            .batch({data, count});
        },
        assign: function (coinId, userId) {
          return $resource(baseUrl + '/coins/:coin_id/assign', {
              coin_id: coinId,
              user_id: userId,
              access_token: $cookies.accessToken
            },
            {assign}).assign();
        }
      };
    }]);
})();
