(function() {
  'use strict';

  angular
    .module('weflexAdmin')
    .directive('wfAddPhoto', wfAddPhoto);

  function wfAddPhoto() {
    var directive = {
      restrict: 'EA',
      replace: true,
      scope: {
        photos: '='
      },
      template: '<div class="add-photos">'+
                  '<div class="control"'+
                    '<label>Photo URL</label><input type="text" ng-model="newPhoto" />'+
                    '<button ng-click="onAdd()">Add</button>'+
                    '<button ng-click="onClear()">Clear ALL photos</button>'+
                  '</div>'+
                  '<ul class="photo-list">'+
                    '<li class="photo" ng-repeat="photo in photos">'+
                      '<img ng-src="{{photo}}" /><div ng-click="onRemove($index)" class="delete fa fa-close"></div>'+
                    '</li>'+
                  '</ul>'+
                '</div>',
      link: link
    };

    return directive;

    function link(scope, elem, attrs) {

      scope.onAdd = function() {
        if (!scope.newPhoto) {
          return;
        }
        if (!scope.photos) {
          scope.photos = [];
        }
        if (scope.photos.indexOf(scope.newPhoto) !== -1) {
          alert('photo exists!');
          return;
        }
        scope.photos.push(scope.newPhoto);
        scope.newPhoto = "";
      }

      scope.onClear = function() {
        var confirm = window.confirm('Do you want to clear ALL photos?');
        if (confirm) {
          scope.photos = [];
        } else {
          return;
        }
      };

      scope.onRemove = function(index) {
        scope.photos.splice(index, 1);
      }
    }
  }
})();