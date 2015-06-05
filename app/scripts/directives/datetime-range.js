'use strict';

angular.module('wechatApp')
.directive('wfDatetimeRange', ['$parse', function($parse) {

  function syncDate(base, date) {
    var result;

    if (!angular.isDate(date)) {
      result = new Date();
    } else {
      result = angular.copy(date);
    }

    result.setFullYear(base.getFullYear());
    result.setMonth(base.getMonth());
    result.setDate(base.getDate());

    result.setSeconds(0);
    result.setMilliseconds(0);

    return result;
  }

  function isDateChanged(newDate, oldDate) {

    if (!angular.isDate(newDate) || !angular.isDate(oldDate)) {
      console.error('isDateChanged Error: Both newValue and oldValue should be date.');
      return;
    }

    return newDate.getFullYear() !== oldDate.getFullYear() || newDate.getMonth() !== oldDate.getMonth() || newDate.getDate() !== oldDate.getDate();
  }

  return {
    restrict: 'E',
    scope: true,
    replace: true,
    template: function(elem, attrs) {
      var fromModel = attrs.fromModel,
          toModel = attrs.toModel;
      return     '<div>'+
                    '<div>'+
                      '<label>Date<span>*</span></label>'+
                      '<input type="date" ng-model="date" ng-change="onDateChange()" />'+
                    '</div>'+
                    '<div>'+
                      '<label>From<span>*</span></label>'+
                      '<input type="time" ng-model="'+fromModel+'" />'+
                    '</div>'+
                    '<div>'+
                      '<label>To<span>*</span></label>'+
                      '<input type="time" ng-model="'+toModel+'" />'+
                    '</div>'+
                  '</div>';

    },
    link: function(scope, elem, attrs) {
      var fromGetter = $parse(attrs.fromModel),
          fromSetter = $parse(attrs.fromModel).assign,
          toGetter = $parse(attrs.toModel),
          toSetter = $parse(attrs.toModel).assign,
          fromModel = attrs.fromModel,
          toModel = attrs.toModel,
          context = scope.$parent,
          fromTime = fromGetter(context),
          toTime = toGetter(context);

      if (angular.isDate(fromTime)) {
        scope.date = angular.copy(fromTime);
      }

      if (!scope.date) {
        scope.date = new Date();
        fromSetter(context, syncDate(scope.date));
        toSetter(context, syncDate(scope.date));
      }

      function modelChangeHandler(newValue, oldValue) {
        if (!angular.isDate(newValue)) {
          console.error('Directive wfDatetimeRange Error: Model should be a Date.');
          return;
        }

        if (angular.isDate(oldValue) && !isDateChanged(newValue, oldValue)) {
          return;
        }

        scope.date = new Date(syncDate(newValue, scope.date));

      }

      scope.$parent.$watch(fromModel, modelChangeHandler);
      scope.$parent.$watch(toModel, modelChangeHandler);

      scope.onDateChange = function() {
        fromSetter(context, syncDate(scope.date, fromGetter(context)));
        toSetter(context, syncDate(scope.date, toGetter(context)));
      }
    }
  }
}])