(function() {
'use strict';

angular.module('weflexAdmin')
  .directive('wfVenueSelect', wfVenueSelect);

  wfVenueSelect.$inject = ['Venues'];
  function wfVenueSelect(Venues) {
    var directive = {
      restrict: 'E',
      scope: {
        venueModel: '='
      },
      template: '<select ng-model="venueModel" '+
                        'ng-options="item.name.en for item in venues | orderBy:\'name.en\' track by item.id" '+
                        'required>'+
                '</select>',
      link: function(scope, elem, attrs) {
        Venues.query().$promise.then(function(res) {
          scope.venues = res;
        });
      }
    };

    return directive;
  }
})();