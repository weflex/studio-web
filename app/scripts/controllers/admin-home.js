'use strict';

angular.module('weflexAdmin').
controller('AdminHomeCtrl', ['$scope', 'wfAPI', 'adminRouteHelper', 'Classes', 'Users', function($scope, wfAPI, adminRouteHelper, Classes, Users) {
  wfAPI.venueAPI.getVenues().success(function(venues) {
    $scope.venues = venues;
  });

  Classes.templates({access_token: Users.accessToken()}).$promise.then(function(classes) {
    $scope.events = classes;
  });

  $scope.editVenueURL = adminRouteHelper.url.EDIT_VENUE;
  $scope.editClassURL = adminRouteHelper.url.EDIT_CLASS;
  $scope.addClassURL = adminRouteHelper.url.ADD_CLASS;

  $scope.dateReverse = false;

  $scope.onAddVenue = function() {
    adminRouteHelper.toAddVenue();
  };

  $scope.onAddClassTemplate = function() {
    adminRouteHelper.toAddClassTemplate();
  };

  $scope.onAddDaypass = function() {
    adminRouteHelper.toAddDaypass();
  };
}]);
