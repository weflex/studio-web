(function() {
  'use strict';

  angular
    .module('wechatApp')
    .directive('wfSimpleMap', wfSimpleMap);

  wfSimpleMap.$inject = ['amap'];

  function wfSimpleMap(amap) {
    var directive = {
      restrict: 'E',
      replace: true,
      scope: {
        loc: '@',
        fitView: '=',
        fitContentId: '@',
        noFullScreen: '='
      },
      link: link,
      template: template
    };

    return directive;

    function template(elem, attrs) {
      var id = attrs.id;
      return '<div class="simple-map">'+
              '<div class="close" ng-click="onExitFullScreen()">'+
                '<i class="fa fa-times-circle close-icon"></i>'+
              '</div>'+
              '<div ng-class="mapStyle" id="'+id+'" ng-click="onFullScreen()" ng-style="fitViewStyle"></div>'+
             '</div>';
    }

    function link(scope, elem, attrs) {
      var loc, fitViewHeight;
      var closeButton = elem[0].children[0];

      _hideCloseButton();

      scope.mapStyle = 'normal';
      scope.mapObj = amap.initMap(attrs.id);

      var done = scope.$watch('loc', function(newValue, oldValue) {
        if(newValue) {
          loc = newValue.trim().split(',');
          scope.mapObj.addMarker(loc[0], loc[1]);
          scope.mapObj.setFitView();
          scope.mapObj.setZoom(14);
          done();
        }
      });

      // Prevent memory leaks
      scope.$on('$destroy', function() {
        scope.mapObj.destroy();
      });

      if (!scope.noFullScreen) {
        scope.onFullScreen = function() {
          _showCloseButton();
          scope.mapStyle = 'full-screen';
          if (scope.fitView && scope.fitViewStyle) {
            fitViewHeight = scope.fitViewStyle.height;
            scope.fitViewStyle.height = '100%';
          }
        };
        scope.onExitFullScreen = function() {
          _hideCloseButton();
          scope.mapStyle = 'normal';
          if (scope.fitView && scope.fitViewStyle) {
            scope.fitViewStyle = {
              height: fitViewHeight
            };
          }
        }
      }

      if (scope.fitView && scope.fitContentId) {
        var watchFn = function() {
          return document.getElementById(scope.fitContentId).offsetHeight;
        };

        scope.$watch(watchFn, function(newValue) {
          if (newValue) {
            scope.fitViewStyle = {
              height: window.innerHeight - newValue + 'px'
            };
          }
        });
      }

      function _showCloseButton() {
        closeButton.hidden = false;
      }
      function _hideCloseButton() {
        closeButton.hidden = true;
      }
    }
  }

})();