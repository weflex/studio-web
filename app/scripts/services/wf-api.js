(function() {
  'use strict';

  angular
    .module('wechatApp')
    .factory('wfAPI', wfAPI);

  wfAPI.$inject = ['wfDebug', '$http', 'wfConfig', 'wfUrlUtil', 'customerRouteHelper'];

  function wfAPI(wfDebug, $http, wfConfig, wfUrlUtil, customerRouteHelper) {
    var BASE_URL = wfConfig.BASE_URL;

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
      var requestUrl = wfUrlUtil.concatUrl(BASE_URL.API + '/users/' + openid);
      return $http.get(requestUrl)
                  .success(function(result) {
                    wfDebug.log('wf-api.js: Get userinfo success');
                  });
    }

    function updateUser(user) {
      return $http.post(BASE_URL.API + '/users/' + user.openid, user);
    }

    function getCategories() {
      return $http.get(BASE_URL.API + '/categories');
    }

    function getLevels() {
      return $http.get(BASE_URL.API + '/levels');
    }

    function getPrices() {
      return $http.get(BASE_URL.API + '/prices');
    }

    function createWechatOrder(classId, cost, classDesc, openid) {

      wfDebug.log('Creating Wechat prepay order... openid: ' + openid);

      return $http.post(BASE_URL.API + '/payments', {
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
      return $http.get(wfUrlUtil.concatUrl(BASE_URL.API + '/orders', filter))
                  .success(function(orders) {
                    angular.forEach(orders, function(order) {
                      order.event.from = _toDate(order.event.from);
                      order.event.to = _toDate(order.event.to);
                    });
                  });
    }

    function getOrderById(orderId) {
      return $http.get(wfUrlUtil.concatUrl(BASE_URL.API) + '/orders/' + orderId )
                  .success(function(order) {
                    order.event.from = _toDate(order.event.from);
                    order.event.to = _toDate(order.event.to);
                  });
    }

    function getVenueById(venueId) {
      return $http.get(BASE_URL.API + '/venues/' + venueId);
    }

    function getVenues() {
      return $http.get(BASE_URL.API + '/venues');
    }

    function addVenue(venue) {
      return $http.post(BASE_URL.API + '/venues', venue);
    }

    function updateVenue(venueId, venue) {
      return $http.post(BASE_URL.API + '/venues/' + venueId, venue);
    }

    function getClassById(classId) {
      return $http.get(BASE_URL.API + '/classes/' + classId).success(function(aClass) {
        aClass.from = _toDate(aClass.from);
        aClass.to = _toDate(aClass.to);
        return aClass;
      });
    }

    function getClasses(filter) {
      var requestUrl = wfUrlUtil.concatUrl(BASE_URL.API + '/classes', filter);
      return $http.get(requestUrl).success(function(classes) {
        angular.forEach(classes, function(aClass) {
          aClass.from = _toDate(aClass.from);
          aClass.to = _toDate(aClass.to);
        });
        return classes;
      });
    }

    function addClass(aClass) {
      var classCopy = angular.copy(aClass);
      if (classCopy && classCopy.from) {
        classCopy.from = _toTimeStamp(classCopy.from);
      }
      if (classCopy && classCopy.to) {
        classCopy.to = _toTimeStamp(classCopy.to);
      }
      console.log(classCopy);
      return $http.post(BASE_URL.API + '/classes', classCopy);
    }

    function updateClass(classId, aClass) {
      var classCopy = angular.copy(aClass);
      if (classCopy && classCopy.from) {
        classCopy.from = _toTimeStamp(classCopy.from);
      }
      if (classCopy && classCopy.to) {
        classCopy.to = _toTimeStamp(classCopy.to);
      }
      return $http.post(BASE_URL.API + '/classes/' + classId, classCopy);
    }
  }
})();
