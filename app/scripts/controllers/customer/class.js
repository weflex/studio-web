(function() {
  'use strict';

  angular
    .module('wechatApp')
    .controller('ClassCtrl', ClassCtrl);

  ClassCtrl.$inject = ['$filter', '$routeParams', '$translate', 'wfAPI', 'wechatAPI', 'wfUrlUtil', 'amap', 'event'];

  function ClassCtrl($filter, $routeParams, $translate, wfAPI, wechatAPI, wfUrlUtil, amap, event) {
    // Force this page to scroll to top
    window.scrollTo(0, 0);

    /* jshint validthis: true */
    var vm = this;

    var classId = $routeParams.classId;

    vm.showMap = false;
    vm.showStudioMore = false;
    vm.event = event.data;


    activate();

    function activate() {
      var lang = $translate.use();
      var event = vm.event;

      document.title = event.title[lang];
      vm.paymentData = {
        class_id: event.id,
        class_title: event.title[lang],
        level: event.level[lang],
        venue: event.venue.name[lang],
        venue_address: event.venue.address[lang],
        time_from: event.from.getTime(),
        time_to: event.to.getTime(),
        datetime: $filter('amDateFormat')(event.from, 'MMM Do, ddd,') + ' ' + $filter('amDateFormat')(event.from, 'h:mm') + ' - ' + $filter('amDateFormat')(event.to, 'h:mm a'),
        cost: event.price[lang]
      };
    }
  }
})();