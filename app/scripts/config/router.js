(function() {
  'use strict';

  angular
    .module('weflexAdmin')
    .config(config);

  config.$inject = ['$routeProvider', '$locationProvider'];

  function config($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/admin'
      })
      .when('/login/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/admin/', {
        templateUrl: 'views/home.html',
        controller: 'AdminHomeCtrl'
      })
      .when('/admin/venues/edit/:venueId', {
        templateUrl: 'views/edit-venue.html',
        controller: 'EditVenueCtrl'
      })
      .when('/admin/venues/add/', {
        templateUrl: 'views/edit-venue.html',
        controller: 'AddVenueCtrl'
      })
      .when('/admin/venues/', {
        templateUrl: 'views/venue-list.html',
      })
      .when('/admin/classes', {
        templateUrl: 'views/class-list.html',
        controller: 'ClassListCtrl'
      })
      .when('/admin/classes/edit/:classId', {
        templateUrl: 'views/edit-class.html',
        controller: 'EditClassCtrl'
      })
      .when('/admin/classes/add/', {
        templateUrl: 'views/edit-class.html',
        controller: 'AddClassCtrl'
      })
      .when('/admin/daypasses', {
        templateUrl: 'views/class-list.html',
        controller: 'DaypassListCtrl'
      })
      .when('/admin/daypasses/add/', {
        templateUrl: 'views/edit-class.html',
        controller: 'AddDaypassCtrl'
      })
      .when('/admin/daypasses/edit/:daypassId', {
        templateUrl: 'views/edit-class.html',
        controller: 'EditDaypassCtrl'
      })
      .when('/admin/orders', {
        templateUrl: 'views/order-list.html',
        controller: 'OrderListCtrl'
      })
      .otherwise({
        redirectTo: '/admin'
      });
    $locationProvider.html5Mode(true);
  }

})();
