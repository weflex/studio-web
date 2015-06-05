(function() {
  'use strict';

  angular
    .module('wechatApp')
    .controller('ClassListCtrl', ClassListCtrl);

  ClassListCtrl.$inject = ['customerRouteHelper', 'wfAPI', 'wfArrayUtil', 'moment', 'classes'];

  function ClassListCtrl(customerRouteHelper, wfAPI, wfArrayUtil, moment, classes) {
    /* jshint validthis: true */
    var vm = this;

    vm.maxClasses = 5;
    vm.onClassClick = onClassClick;
    vm.events = classes.data;

    activate();

    ///////////////////////

    function activate() {
      vm.events = wfArrayUtil.groupBy(vm.events.sort(_sortComp), _groupComp);
    }

    function onClassClick(classId) {
      customerRouteHelper.toClass(classId);
    }

    function _sortComp(a, b){
      if (a.from < b.from) {
        return -1;
      }

      if (a.from > b.from) {
        return 1;
      }

      return 0;
    }

    function _groupComp(a, b) {
      return moment(a.from).isSame(b.from, 'day');
    }
  }
})();