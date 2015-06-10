(function() {
  'use strict';

  angular
    .module('weflexAdmin')
    .factory('wfAPI', wfAPI);

  wfAPI.$inject = ['wfDebug', '$http', 'wfConfig', 'wfUrlUtil'];

  function wfAPI(wfDebug, $http, wfConfig, wfUrlUtil) {
    var baseUrl = wfConfig.BASE_URL.API + '/api';

    var factory = {
      commonAPI: {
        getCategories: getCategories,
        getLevels: getLevels,
        getPrices: getPrices
      },
      userAPI: {
        getUserinfo: getUserinfo,
        updateUser: updateUser
      },
      orderAPI: {
        createWechatOrder: createWechatOrder,
        getOrders: getOrders,
        getOrderById: getOrderById
      },
      venueAPI: {
        getVenues: getVenues,
        getVenueById: getVenueById,
        addVenue: addVenue,
        updateVenue: updateVenue
      },
      classAPI: {
        getClasses: getClasses,
        getClassById: getClassById,
        addClass: addClass,
        updateClass: updateClass
      }
    };

    return factory;

    ///////////////////////////

    function _toDate(timestamp) {
      var _d = new Date(timestamp * 1000);

      if (angular.isDate(_d)) {
        return _d;
      } else {
        return timestamp;
      }
    }

    function _toTimeStamp(date) {
      if (angular.isDate(date)) {
        return Math.round(date.getTime() / 1000);
      }
    }

   function getUserinfo(openid) {
      var requestUrl = wfUrlUtil.concatUrl(baseUrl + '/users/' + openid);
      return $http.get(requestUrl)
                  .success(function(result) {
                    wfDebug.log('wf-api.js: Get userinfo success');
                  });
    }

    function updateUser(user) {
      return $http.post(baseUrl + '/users/' + user.openid, user);
    }

    function getCategories() {
      return $http.get(baseUrl + '/categories');
    }

    function getLevels() {
      return $http.get(baseUrl + '/levels');
    }

    function getPrices() {
      return $http.get(baseUrl + '/prices');
    }

    function createWechatOrder(classId, cost, classDesc, openid) {

      wfDebug.log('Creating Wechat prepay order... openid: ' + openid);

      return $http.post(baseUrl + '/payments', {
                    product_id: classId,
                    product_cost: parseInt(cost, 10) * 100,
                    product_desc: classDesc.substring(0, 31),
                    user_id: openid
                  }).success(function(result) {
                    wfDebug.log(JSON.stringify(result));
                    if (!result.prepay_id) {
                       if (result && result.error && result.error.code) {
                         wfDebug.error('PayCtrl Error: Create prey order failed. Error_code: ' + result.error.code);
                       } else {
                        wfDebug.error(result);
                       }
                     } else {
                      wfDebug.log('successfully create prepay order');
                     }
                  });

    }

    function getOrders(filter) {
      return $http.get(wfUrlUtil.concatUrl(baseUrl + '/orders', filter))
                  .success(function(orders) {
                    angular.forEach(orders, function(order) {
                      order.event.from = _toDate(order.event.from);
                      order.event.to = _toDate(order.event.to);
                    });
                  });
    }

    function getOrderById(orderId) {
      return $http.get(wfUrlUtil.concatUrl(baseUrl) + '/orders/' + orderId )
                  .success(function(order) {
                    order.event.from = _toDate(order.event.from);
                    order.event.to = _toDate(order.event.to);
                  });
    }

    function getVenueById(venueId) {
      return $http.get(baseUrl + '/venues/' + venueId);
    }

    function getVenues() {
      return $http.get(baseUrl + '/venues');
    }

    function addVenue(venue) {
      return $http.post(baseUrl + '/venues', venue);
    }

    function updateVenue(venueId, venue) {
      return $http.put(baseUrl + '/venues/' + venueId, venue);
    }

    function getClassById(classId) {
      return $http.get(baseUrl + '/classes/' + classId).success(function(aClass) {
        aClass.from = new Date(aClass.from);
        aClass.to = new Date(aClass.to);
        return aClass;
      });
    }

    function getClasses(filter) {
      var requestUrl = wfUrlUtil.concatUrl(baseUrl + '/classes', filter);
      return $http.get(requestUrl).success(function(classes) {
        angular.forEach(classes, function(aClass) {
          aClass.from = new Date(aClass.from);
          aClass.to = new Date(aClass.to);
        });
        return classes;
      });
    }

    function addClass(aClass) {
      return $http.post(baseUrl + '/classes', aClass);
    }

    function updateClass(classId, aClass) {
      return $http.put(baseUrl + '/classes/' + classId, aClass);
    }
  }
})();
