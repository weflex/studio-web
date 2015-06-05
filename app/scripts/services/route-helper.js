angular.module('wechatApp')
.factory('adminRouteHelper', ['$location', function($location) {
  return {
    url: {
      VENUES: '/admin/venues/',
      EDIT_VENUE: '/admin/venues/edit/',
      ADD_VENUE: '/admin/venues/add/',
      CLASSES: '/admin/classes/',
      ADD_CLASS: '/admin/classes/add/',
      EDIT_CLASS: '/admin/classes/edit/'
    },
    toHome: function() {
      $location.url('/admin');
    },
    toVenueList: function() {
      $location.url(this.url.VENUES);
    },
    toVenue: function(venueId) {
      $location.url('/admin/venues/' + venueId);
    },
    toAddVenue: function() {
      $location.url(this.url.ADD_VENUE);
    },
    toEditVenue: function(venueId) {
      $location.url(this.url.EDIT_VENUE + venueId);
    },
    toClassList: function() {
      $location.url(this.url.CLASSES);
    },
    toClass: function(classId) {
      $location.url('/admin/classes/' + classId);
    },
    toAddClass: function() {
      $location.url(this.url.ADD_CLASS);
    },
    toEditClass: function(classId) {
      $location.url(this.url.EDIT_CLASS + classId);
    },
  }
}])