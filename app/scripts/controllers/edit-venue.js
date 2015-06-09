'use strict';

angular.module('weflexAdmin')
.controller('EditVenueCtrl', ['$scope', '$routeParams', 'wfAPI', 'adminRouteHelper', 'amap', function($scope, $routeParams, wfAPI, adminRouteHelper, amap) {
  var venueId = $routeParams.venueId,
      mapObj = amap.initMap();

  wfAPI.venueAPI.getVenueById(venueId).success(function(venue) {
    $scope.venue = venue;

    return venue;
  }).success(function(venue) {
    if (venue && venue.loc) {
      var lng = venue.loc.split(',')[0],
          lat = venue.loc.split(',')[1];

      mapObj.addMarker(lng, lat);
      mapObj.setFitView();
    }

    return venue;
  });

  $scope.onSearchAddress = function() {
    mapObj.searchAddress($scope.venue.address.zh, function(lng, lat) {

      $scope.$apply(function() {
        $scope.venue.loc = lng + ',' + lat;
      });

    })
  };

  $scope.onSubmit = function() {
    if ($scope.venueForm.$valid) {

      wfAPI.venueAPI.updateVenue(venueId, $scope.venue).success(function() {
        alert('Successfully update Venue!');
        adminRouteHelper.toHome();
      })
      .error(function() {
        alert('Update venue failed');
      });
    }
  }

  $scope.onCancel = function() {
    adminRouteHelper.toHome();
  }
}]);