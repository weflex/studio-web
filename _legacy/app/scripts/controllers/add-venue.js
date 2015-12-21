'use strict';

angular.module('weflexAdmin').
controller('AddVenueCtrl', ['$scope', 'wfAPI', 'adminRouteHelper', 'amap', function($scope, wfAPI, adminRouteHelper, amap) {
  $scope.submitDisabled = false;
  var mapObj = amap.initMap();

  $scope.venue = {};

  $scope.onSearchAddress = function() {

    mapObj.searchAddress($scope.venue.address.zh, function(lng, lat) {

      $scope.$apply(function() {
        $scope.venue.loc = lng + ',' + lat;
      });

    })
  };

  $scope.onSubmit = function() {
    if($scope.venueForm.$valid) {
      $scope.submitDisabled = true;
      wfAPI.venueAPI.addVenue($scope.venue).success(function(result) {
        adminRouteHelper.back();
      })
      .error(function() {
        console.error('AddVenueCtrl: add venue failed.');
      });
    }
  };

  $scope.onCancel = function() {
    adminRouteHelper.back();
  };

}]);