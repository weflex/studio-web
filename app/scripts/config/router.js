(function() {
  'use strict';

  angular
    .module('wechatApp')
    .config(config);

  config.$inject = ['$routeProvider', '$locationProvider'];

  function config($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/classes'
      })
      .when('/404', {
        templateUrl: 'views/customer/404.html'
      })
      .when('/oauth/redirect', {
        templateUrl: 'views/customer/oauth-redirect.html',
        controller: 'OAuthRedirectCtrl'
      })
      .when('/pay_test/test', {
        templateUrl: 'views/test_payment/pay.html',
        controller: 'PayCtrl'
      })
      .when('/orders/:orderId', {
        templateUrl: 'views/customer/order.html',
        controller: 'OrderCtrl',
        controllerAs: 'vm'
      })
      .when('/classes', {
        templateUrl: 'views/customer/class-list.html',
        controller: 'ClassListCtrl',
        controllerAs: 'vm',
        resolve: {
          classes: classesPrepService
        }
      })
      .when('/classes/:classId', {
        templateUrl: 'views/customer/class.html',
        controller: 'ClassCtrl',
        controllerAs: 'vm',
        resolve: {
          event: classPrepService
        }
      })
      .when('/admin/', {
      templateUrl: 'views/admin/home.html',
        controller: 'AdminHomeCtrl'
      })
      .when('/admin/venues/edit/:venueId', {
        templateUrl: 'views/admin/edit-venue.html',
        controller: 'EditVenueCtrl'
      })
      .when('/admin/venues/add/', {
        templateUrl: 'views/admin/edit-venue.html',
        controller: 'AddVenueCtrl'
      })
      .when('/admin/venues/', {
        templateUrl: 'views/admin/venue-list.html',
      })
      .when('/admin/classes/edit/:classId', {
        templateUrl: 'views/admin/edit-class.html',
        controller: 'EditClassCtrl'
      })
      .when('/admin/classes/add/', {
        templateUrl: 'views/admin/edit-class.html',
        controller: 'AddClassCtrl'
      })
      .when('/admin/classes/', {
        templateUrl: 'views/admin/class-list.html'
      })
      .otherwise({
        redirectTo: '/classes'
      });
    $locationProvider.html5Mode(true);
  }

  classesPrepService.$inject = ['wfAPI'];
  function classesPrepService(wfAPI) {
    return wfAPI.classAPI.getClasses({future: true});
  }

  classPrepService.$inject = ['wfAPI', '$route'];
  function classPrepService(wfAPI, $route) {
    return wfAPI.classAPI.getClassById($route.current.params.classId);
  }
})();