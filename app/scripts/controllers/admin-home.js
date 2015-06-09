'use strict';

angular.module('weflexAdmin').
controller('AdminHomeCtrl', ['$scope', 'wfAPI', 'adminRouteHelper', function($scope, wfAPI, adminRouteHelper) {
  wfAPI.venueAPI.getVenues().success(function(venues) {
    $scope.venues = venues;
  });

  wfAPI.classAPI.getClasses().success(function(events) {
    $scope.events = events;
  });

  $scope.editVenueURL = adminRouteHelper.url.EDIT_VENUE;
  $scope.editClassURL = adminRouteHelper.url.EDIT_CLASS;
  $scope.dateReverse = false;

  $scope.onAddVenue = function() {
    adminRouteHelper.toAddVenue();
  }

  $scope.onAddClass = function() {
    adminRouteHelper.toAddClass();
  }
}]);