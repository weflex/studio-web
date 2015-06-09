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
      .when('/admin/classes/edit/:classId', {
        templateUrl: 'views/edit-class.html',
        controller: 'EditClassCtrl'
      })
      .when('/admin/classes/add/', {
        templateUrl: 'views/edit-class.html',
        controller: 'AddClassCtrl'
      })
      .otherwise({
        redirectTo: '/admin'
      });
    $locationProvider.html5Mode(true);
  }

})();