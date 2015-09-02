(function() {
'use strict';

angular.module('weflexAdmin')
  .directive('wfAmenities', function() {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        list: '='
      },
      template: '<ul class="amenities">'+
                  '<li ng-repeat="(amenity, checked) in allAmenities">'+
                    '<label class="label">'+
                      '<input type="checkbox" ng-model="allAmenities[amenity]" ng-change="onChange(amenity, checked)"/>'+
                      '{{amenity}}'+
                    '</label>'+
                  '</li>'+
                '</ul>',
      link: link
    };

    return directive;

    function link(scope, elem, attrs) {
      scope.allAmenities = {
        'Wi-Fi': false,
        'Shower': false,
        'Parking': false,
        'Toilet': false,
        'Changing Room': false
      };

      scope.onChange = function(amenity, checked) {
        scope.list = scope.list || [];
        if (checked) {
          scope.list.push(amenity);
        } else {
          scope.list.splice(scope.list.indexOf(amenity), 1);
        }
      };
    }
  });
})();
