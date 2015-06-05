(function() {
  'use strict';

  angular
    .module('wechatApp')
    .directive('wfAddPhoto', wfAddPhoto);

  function wfAddPhoto() {
    var directive = {
      restrict: 'EA',
      replace: true,
      scope: {
        photos: '='
      },
      template: '<div class="add-images">'+
                '<ul style="margin-bottom: 10px;">'+
                  '<li ng-repeat="photo in photos" clearfix>'+
                    '<div style="display:inline-block;width:50%;text-align:right;">'+
                      '<input type="text" ng-model="photo.url" placeholder="Url" style="width:100%" />'+
                      '<input type="text" ng-model="photo.caption" placeholder="Caption" style="width:100%" />'+
                    '</div>'+
                    '<div style="display:inline-block;width:20%;text-align:right;">'+
                      '<button ng-click="onRemovePhoto($index)">Remove</button>'+
                    '</div>'+
                    '<div style="display:inline-block;width:30%; vertical-align:top;text-align:right;">'+
                      '<img ng-src="{{photo.url}}" height="90px" />'+
                    '</div>'+
                  '</li>'+
                '</ul>'+
                '<button ng-click="onAddPhoto()">Add</button>'+
              '</div>',
      link: link
    };

    return directive;

    function link(scope, elem, attrs) {

      scope.onAddPhoto = function() {
        if (!scope.photos) {
          scope.photos = [];
        }
        scope.photos.push({});
      }

      scope.onRemovePhoto = function(index) {
        scope.photos.splice(index, 1);
      }
    }
  }
})();