(function() {
'use strict';

angular.module('weflexAdmin')
  .directive('wfMarkdownEditor', wfMarkdownEditor);

  function wfMarkdownEditor() {
    var directive = {
      restrict: 'EA',
      replace: true,
      scope: {
        model: '='
      },
      template: function(elem, attrs) {
        return '<div></div>';
      },
      compile: function(elem, attrs) {
        var model = attrs.model;
        var id = attrs.id;
        var editor = new MarkdownEditor('#' + id);
        editor.render();
        elem.find('textarea').attr('ng-model', 'model');

        return function(scope, elem, attrs) {
          scope.$on('$destroy', function() {
            editor = null;
          });
        }
      }
    };

    return directive;
  }
})();